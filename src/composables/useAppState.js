import { reactive } from 'vue'
import { STORES } from '@/data/mockDashboard'

export const ROLES = [
  { key: 'HQ', label: 'HQ Manager', short: 'H' },
  { key: 'REGION', label: '区域督导', short: '区' },
  { key: 'STORE', label: '门店药师', short: '门' },
]

const ROLE_BY_LABEL = Object.fromEntries(ROLES.map(r => [r.label, r]))

const initialStoreId = STORES[0]?.store_id || 'S001'

const state = reactive({
  role: ROLES[0].label,
  storeId: initialStoreId,
})

export const appState = state

export function setRole(label) {
  if (ROLE_BY_LABEL[label]) state.role = label
}

export function setStore(storeId) {
  if (STORES.some(s => s.store_id === storeId)) state.storeId = storeId
}

export function currentStore() {
  return STORES.find(s => s.store_id === state.storeId) || STORES[0]
}

export function roleMeta() {
  return ROLE_BY_LABEL[state.role] || ROLES[0]
}
