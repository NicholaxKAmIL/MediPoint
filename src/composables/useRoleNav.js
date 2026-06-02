import { computed } from 'vue'
import { currentRole } from './useAuth'

export function useRoleNav() {
  const navItems = computed(() => {
    const role = currentRole.value
    if (role === 'HQ Manager') {
      return [
        { name: '战情总览',   path: '/' },
        { name: '全网舆情',   path: '/sentiment' },
        { name: 'AI 采购决策', path: '/decisions' },
        { name: '法规政策',   path: '/regulations' },
        { name: '门店对比',   path: '/stores' },
        { name: '策略下发',   path: '/strategy' },
      ]
    }
    if (role === '区域督导') {
      return [
        { name: '战情总览',   path: '/' },
        { name: '区域舆情',   path: '/sentiment' },
        { name: 'AI 采购决策', path: '/decisions' },
        { name: '法规政策',   path: '/regulations' },
        { name: '门店对比',   path: '/stores' },
      ]
    }
    if (role === '门店药师') {
      return [
        { name: '今日速报',   path: '/' },
        { name: 'AI 客户咨询', path: '/chat' },
        { name: '采购建议',   path: '/decisions' },
        { name: '法规速查',   path: '/regulations' },
        { name: '话术模板',   path: '/strategy' },
      ]
    }
    return []
  })

  return { navItems }
}
