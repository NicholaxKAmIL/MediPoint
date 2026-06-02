import { getDashboardByScope } from '@/data/mockDashboard'
import { getSentimentByScope } from '@/data/mockSentiment'
import { getDecisionsByScope } from '@/data/mockDecisions'
import { getRegulationsByScope } from '@/data/mockRegulations'
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

function visibleIds(account) {
  return account?.store_ids || []
}

export async function fetchDashboard(account) {
  if (USE_MOCK) return getDashboardByScope(account, visibleIds(account))
  const sid = account?.store_ids?.[0] || ''
  return (await safeFetch(`/api/mock/dashboard?store=${sid}`)) || getDashboardByScope(account, visibleIds(account))
}

export async function fetchSentiment(account) {
  if (USE_MOCK) return getSentimentByScope(account, visibleIds(account))
  const sid = account?.store_ids?.[0] || ''
  return (await safeFetch(`/api/mock/sentiment?store=${sid}`)) || getSentimentByScope(account, visibleIds(account))
}

export async function fetchDecisions(account) {
  if (USE_MOCK) return getDecisionsByScope(account, visibleIds(account))
  const sid = account?.store_ids?.[0] || ''
  return (await safeFetch(`/api/mock/decisions?store=${sid}`)) || getDecisionsByScope(account, visibleIds(account))
}

export async function fetchRegulations(account) {
  if (USE_MOCK) return getRegulationsByScope(account, visibleIds(account))
  const sid = account?.store_ids?.[0] || ''
  return (await safeFetch(`/api/mock/regulations?store=${sid}`)) || getRegulationsByScope(account, visibleIds(account))
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
