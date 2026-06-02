// 统一数据访问层 — 开发阶段默认使用内嵌 mock
import { getDashboardMock } from '@/data/mockDashboard'
import { getSentimentMock } from '@/data/mockSentiment'
import { getDecisionsMock } from '@/data/mockDecisions'
import { getRegulationsMock } from '@/data/mockRegulations'
import { chatReply as mockChatReply } from '@/data/mockChat'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

async function safeFetch(path, opts = {}) {
  try {
    const r = await fetch(`${API_BASE}${path}`, opts)
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return await r.json()
  } catch (e) {
    console.warn(`[api] fallback to mock for ${path}:`, e.message)
    return null
  }
}

export async function fetchDashboard() {
  if (USE_MOCK) return getDashboardMock()
  return (await safeFetch('/api/mock/dashboard')) || getDashboardMock()
}

export async function fetchSentiment() {
  if (USE_MOCK) return getSentimentMock()
  return (await safeFetch('/api/mock/sentiment')) || getSentimentMock()
}

export async function fetchDecisions() {
  if (USE_MOCK) return getDecisionsMock()
  return (await safeFetch('/api/mock/decisions')) || getDecisionsMock()
}

export async function fetchRegulations() {
  if (USE_MOCK) return getRegulationsMock()
  return (await safeFetch('/api/mock/regulations')) || getRegulationsMock()
}

export async function sendChat(message) {
  if (USE_MOCK) return mockChatReply(message)
  const data = await safeFetch('/api/mock/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })
  return data || mockChatReply(message)
}
