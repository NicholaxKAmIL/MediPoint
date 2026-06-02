import { createRouter, createWebHistory } from 'vue-router'
import { authState, isLoggedIn } from '@/composables/useAuth'

import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
import SentimentView from '@/views/SentimentView.vue'
import DecisionsView from '@/views/DecisionsView.vue'
import RegulationsView from '@/views/RegulationsView.vue'
import StoresView from '@/views/StoresView.vue'
import StrategyView from '@/views/StrategyView.vue'
import ChatView from '@/views/ChatView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login',        name: 'login',       component: LoginView,       meta: { public: true } },
    { path: '/',             name: 'dashboard',   component: DashboardView },
    { path: '/sentiment',    name: 'sentiment',   component: SentimentView,   meta: { roles: ['HQ Manager', '区域督导', '门店药师'] } },
    { path: '/decisions',    name: 'decisions',   component: DecisionsView,   meta: { roles: ['HQ Manager', '区域督导', '门店药师'] } },
    { path: '/regulations',  name: 'regulations', component: RegulationsView, meta: { roles: ['HQ Manager', '区域督导', '门店药师'] } },
    { path: '/stores',       name: 'stores',      component: StoresView,      meta: { roles: ['HQ Manager', '区域督导'] } },
    { path: '/strategy',     name: 'strategy',    component: StrategyView,    meta: { roles: ['HQ Manager', '门店药师'] } },
    { path: '/chat',         name: 'chat',        component: ChatView,        meta: { roles: ['HQ Manager', '区域督导', '门店药师'] } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to) => {
  if (to.meta?.public) {
    if (isLoggedIn.value && to.name === 'login') return { name: 'dashboard' }
    return true
  }
  if (!isLoggedIn.value) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  const allowed = to.meta?.roles
  if (Array.isArray(allowed) && allowed.length > 0) {
    const role = authState.account?.role
    if (!allowed.includes(role)) {
      return { name: 'dashboard' }
    }
  }
  return true
})

export default router
