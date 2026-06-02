import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import SentimentView from '../views/SentimentView.vue'
import DecisionsView from '../views/DecisionsView.vue'
import RegulationsView from '../views/RegulationsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/',            name: 'dashboard',   component: DashboardView },
    { path: '/sentiment',   name: 'sentiment',   component: SentimentView },
    { path: '/decisions',   name: 'decisions',   component: DecisionsView },
    { path: '/regulations', name: 'regulations', component: RegulationsView },
  ],
})

export default router
