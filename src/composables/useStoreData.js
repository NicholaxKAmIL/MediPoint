import {
  appState,
  setRole,
  setStore,
  currentStore,
  roleMeta,
  ROLES,
} from '@/composables/useAppState'
import { STORES } from '@/data/mockDashboard'
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

export async function fetchDashboard(storeId) {
  if (USE_MOCK) return getDashboardMock(storeId)
  return (await safeFetch(`/api/mock/dashboard?store=${storeId || ''}`)) || getDashboardMock(storeId)
}

export async function fetchSentiment(storeId) {
  if (USE_MOCK) return getSentimentMock(storeId)
  return (await safeFetch(`/api/mock/sentiment?store=${storeId || ''}`)) || getSentimentMock(storeId)
}

export async function fetchDecisions(storeId) {
  if (USE_MOCK) return getDecisionsMock(storeId)
  return (await safeFetch(`/api/mock/decisions?store=${storeId || ''}`)) || getDecisionsMock(storeId)
}

export async function fetchRegulations(storeId) {
  if (USE_MOCK) return getRegulationsMock(storeId)
  return (await safeFetch(`/api/mock/regulations?store=${storeId || ''}`)) || getRegulationsMock(storeId)
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

export function useAppState() {
  return { appState, setRole, setStore, currentStore, roleMeta, ROLES, STORES }
}
