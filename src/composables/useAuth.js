import { reactive, computed } from 'vue'
import { findAccountByEmail, visibleStoreIds } from '@/data/mockAccounts'

const SESSION_KEY = 'mediPointSession'

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed?.email) {
      const account = findAccountByEmail(parsed.email)
      return account || null
    }
  } catch (e) {
    console.warn('[auth] session parse error:', e)
  }
  return null
}

const state = reactive({
  account: loadSession(),
})

export const authState = state

export const isLoggedIn = computed(() => !!state.account)
export const currentAccount = computed(() => state.account)
export const currentRole = computed(() => state.account?.role || '')
export const currentVisibleStoreIds = computed(() => visibleStoreIds(state.account))

export function login(email) {
  const account = findAccountByEmail(email)
  if (!account) {
    console.warn('[auth] account not found:', email)
    return false
  }
  state.account = account
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email: account.email }))
  } catch (e) {
    console.warn('[auth] session save error:', e)
  }
  return true
}

export function logout() {
  state.account = null
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch (e) {
    console.warn('[auth] session clear error:', e)
  }
}

export function useAuth() {
  return {
    authState,
    isLoggedIn,
    currentAccount,
    currentRole,
    currentVisibleStoreIds,
    login,
    logout,
  }
}
