import { computed } from 'vue'
import { currentAccount, currentRole, currentVisibleStoreIds } from './useAuth'
import { storesByIds } from '@/data/mockAccounts'

export function useStoreScope() {
  const stores = computed(() => storesByIds(currentVisibleStoreIds.value))
  const primaryStore = computed(() => stores.value[0] || null)

  const scopeName = computed(() => {
    const role = currentRole.value
    if (role === 'HQ Manager') return '集团'
    if (role === '区域督导') {
      const city = currentAccount.value?.cities?.[0] || '区域'
      return `${city}区域`
    }
    return primaryStore.value?.name || '本店'
  })

  return {
    stores,
    primaryStore,
    scopeName,
    visibleStoreIds: currentVisibleStoreIds,
  }
}
