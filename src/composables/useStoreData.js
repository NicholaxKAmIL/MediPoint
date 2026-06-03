import { getDashboardByScope } from '@/data/mockDashboard'
import { getSentimentByScope } from '@/data/mockSentiment'
import { getDecisionsByScope } from '@/data/mockDecisions'
import { getRegulationsByScope } from '@/data/mockRegulations'
import { chatReply as mockChatReply } from '@/data/mockChat'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'
const API_AUTH = (import.meta.env.VITE_API_USER && import.meta.env.VITE_API_PASS)
  ? 'Basic ' + btoa(`${import.meta.env.VITE_API_USER}:${import.meta.env.VITE_API_PASS}`)
  : null

// 简单内存缓存 (per key, 30s TTL), 同时合并 in-flight 请求
const _cache = new Map()
const _inFlight = new Map()
const CACHE_TTL_MS = 30_000

function _memoKey(account, kind) {
  const sid = account?.store_ids?.[0] || 'S001'
  return `${kind}::${sid}`
}

function storeParam(account) {
  const sid = account?.store_ids?.[0] || 'S001'
  return `store=${encodeURIComponent(sid)}`
}

async function safeFetch(path, opts = {}) {
  const headers = { ...(opts.headers || {}) }
  if (API_AUTH) headers['Authorization'] = API_AUTH
  try {
    const r = await fetch(`${API_BASE}${path}`, { ...opts, headers })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return await r.json()
  } catch (e) {
    console.warn(`[api] fallback to mock for ${path}:`, e.message)
    return null
  }
}

async function fetchWithMock(kind, path, account, mockFn) {
  if (USE_MOCK) return mockFn(account, account?.store_ids || [])
  const key = _memoKey(account, kind)
  const cached = _cache.get(key)
  if (cached && Date.now() - cached.t < CACHE_TTL_MS) return cached.v
  if (_inFlight.has(key)) return _inFlight.get(key)

  const promise = safeFetch(path).then((data) => {
    const v = data || mockFn(account, account?.store_ids || [])
    _cache.set(key, { t: Date.now(), v })
    _inFlight.delete(key)
    return v
  })
  _inFlight.set(key, promise)
  return promise
}

const SOURCE_TO_LABEL = {
  NMPA: 'NMPA',
  FJ_WJW: '福建省卫健委',
  FJ_CDC: '福建 CDC',
  CN_CDC: '中国 CDC',
}

function adaptRegulations(data) {
  if (!data || !Array.isArray(data.items)) return data
  return {
    ...data,
    items: data.items.map((it) => ({
      id: it._id || it.url || it.title,
      ...it,
      source: SOURCE_TO_LABEL[it.source] || it.source,
      response: it.response || '请登录 ERP 系统查看具体应对流程, 或联系总部合规部门。',
    })),
  }
}

export async function fetchDashboard(account) {
  return fetchWithMock('dashboard', `/api/dashboard/weekly-report?${storeParam(account)}`, account, getDashboardByScope)
}

export async function fetchSentiment(account) {
  return fetchWithMock('sentiment', `/api/sentiment?${storeParam(account)}`, account, getSentimentByScope)
}

export async function fetchDecisions(account) {
  return fetchWithMock('decisions', `/api/decisions?${storeParam(account)}`, account, getDecisionsByScope)
}

export async function fetchRegulations(account) {
  if (USE_MOCK) return getRegulationsByScope(account, account?.store_ids || [])
  const key = _memoKey(account, 'regulations')
  const cached = _cache.get(key)
  if (cached && Date.now() - cached.t < CACHE_TTL_MS) return cached.v
  if (_inFlight.has(key)) return _inFlight.get(key)
  const promise = safeFetch(`/api/regulations?source=all&limit=200`).then((data) => {
    const v = adaptRegulations(data) || getRegulationsByScope(account, account?.store_ids || [])
    _cache.set(key, { t: Date.now(), v })
    _inFlight.delete(key)
    return v
  })
  _inFlight.set(key, promise)
  return promise
}

/**
 * 流式调用 /api/chat (SSE)
 * - onDelta(content): 每收到一段文本片段就调用
 * - onReferences(items): 收到参考资料事件时调用
 * - onDone({source, duration_ms}): 流结束时调用
 * - 失败/网络错 → 回调一次 onDelta(mockReply) + onDone
 * - 30s 超时 (AbortController)
 */
export async function streamChat(message, history, onDelta, onDone, signal, onReferences) {
  if (USE_MOCK) {
    const reply = mockChatReply(message)
    onDelta(reply.answer)
    onDone({ source: reply.source, duration_ms: 0 })
    return
  }

  let received = ''
  let references = null
  const controller = signal ? null : new AbortController()
  const s = signal || controller?.signal
  const timeoutId = controller ? setTimeout(() => controller.abort(), 30_000) : null
  try {
    const headers = { 'Content-Type': 'application/json' }
    if (API_AUTH) headers['Authorization'] = API_AUTH
    const r = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message, history: history || [] }),
      signal: s,
    })
    if (!r.ok || !r.body) throw new Error(`HTTP ${r.status}`)
    const reader = r.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    let endInfo = { source: 'DeepSeek-R1', duration_ms: 0 }
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      let idx
      while ((idx = buffer.indexOf('\n\n')) >= 0) {
        const evt = buffer.slice(0, idx)
        buffer = buffer.slice(idx + 2)
        const dataLine = evt.split('\n').find(l => l.startsWith('data:'))
        if (!dataLine) continue
        try {
          const payload = JSON.parse(dataLine.slice(5).trim())
          if (payload.type === 'delta' && payload.content) {
            received += payload.content
            onDelta(payload.content)
          } else if (payload.type === 'references') {
            references = Array.isArray(payload.items) ? payload.items : []
            if (typeof onReferences === 'function') onReferences(references)
          } else if (payload.type === 'end') {
            endInfo = {
              source: payload.source,
              duration_ms: payload.duration_ms,
              rag_used: payload.rag_used,
              retrieved_count: payload.retrieved_count,
            }
          } else if (payload.type === 'error') {
            references = []
            throw new Error(payload.message)
          }
        } catch (parseErr) {
          if (parseErr instanceof Error && parseErr.message && evt.includes('"type":"error"')) {
            throw parseErr
          }
        }
      }
    }
    if (!received) {
      const reply = mockChatReply(message)
      onDelta(reply.answer)
      onDone({ source: reply.source, duration_ms: 0, references })
    } else {
      onDone({ ...endInfo, references })
    }
  } catch (e) {
    console.warn('[chat] stream failed, falling back to mock:', e.message)
    if (!received) {
      const reply = mockChatReply(message)
      onDelta(reply.answer)
    }
    onDone({ source: 'FAQ-Fallback', duration_ms: 0, references })
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}

export async function sendChat(message) {
  let answer = ''
  let source = ''
  await streamChat(message, [], (delta) => { answer += delta }, (info) => { source = info.source })
  return { answer, source, confidence: 'high' }
}
