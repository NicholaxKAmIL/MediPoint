<script setup>
import { ref, computed } from 'vue'
import { fetchDashboard, fetchDecisions, fetchRegulations } from '@/data'
import { currentAccount, currentRole } from '@/composables/useAuth'
import { useStoreScope } from '@/composables/useStoreScope'
import { useScopedLoader } from '@/composables/useScopedLoader'
import { KPI_BY_STORE_EXPORT } from '@/data/mockDashboard'
import AlertTicker from '@/components/AlertTicker.vue'
import KpiCards from '@/components/KpiCards.vue'
import SuggestionCard from '@/components/SuggestionCard.vue'
import RiskBadge from '@/components/RiskBadge.vue'

const { scopeName, stores } = useStoreScope()

const reportDate = ref('')
const kpi = ref({})
const alerts = ref([])
const urgentSuggestions = ref([])
const topRisks = ref([])

const marginColorByStore = (sid) => {
  const k = KPI_BY_STORE_EXPORT[sid]
  if (!k) return 'bg-slate-200'
  if (k.margin_status === 'low') return 'bg-orange-400'
  if (k.margin_num >= 13) return 'bg-emerald-500'
  return 'bg-amber-400'
}

const maxMargin = computed(() => {
  const vals = stores.value.map(s => KPI_BY_STORE_EXPORT[s.store_id]?.margin_num || 0)
  return Math.max(15, ...vals)
})

const { loading } = useScopedLoader(
  async () => {
    const account = currentAccount.value
    if (!account) return null
    return await Promise.all([
      fetchDashboard(account),
      fetchDecisions(account),
      fetchRegulations(account),
    ])
  },
  ([d, dec, reg]) => {
    if (!d) return
    reportDate.value = d.report_date
    kpi.value = d.kpiData
    alerts.value = d.alerts
    const confRank = { A: 0, B: 1, C: 2 }
    urgentSuggestions.value = [...dec.restock]
      .sort((a, b) => (confRank[a.confidence] ?? 3) - (confRank[b.confidence] ?? 3))
      .slice(0, 5)
    topRisks.value = reg.items
      .filter(r => r.risk_level === 'High' || r.risk_level === 'Medium')
      .slice(0, 5)
  },
  { watchSource: currentAccount }
)
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <AlertTicker :alerts="alerts" />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div class="flex items-end justify-between flex-wrap gap-2">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span class="w-2 h-7 bg-emerald-500 rounded-full"></span>
            集团战情总览
          </h1>
          <p class="text-xs text-slate-500 mt-1">报告日期 · {{ reportDate }} · {{ scopeName }}（{{ stores.length }} 店）</p>
        </div>
        <router-link
          to="/decisions"
          class="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-md font-medium transition"
        >
          查看完整决策 →
        </router-link>
      </div>

      <KpiCards :kpi="kpi" />

      <section class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 class="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
          <span class="w-1.5 h-5 bg-emerald-500 rounded"></span>
          跨区域毛利率对比
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div v-for="s in stores" :key="s.store_id" class="text-center">
            <p class="text-xs text-slate-500 mb-1">{{ s.city }} · {{ s.region }}</p>
            <p class="text-[10px] text-slate-400 mb-2 truncate">{{ s.name }}</p>
            <div class="h-32 flex items-end justify-center mb-1">
              <div
                :class="['w-12 rounded-t transition-all', marginColorByStore(s.store_id)]"
                :style="`height: ${((KPI_BY_STORE_EXPORT[s.store_id]?.margin_num || 0) / maxMargin) * 100}%`"
              ></div>
            </div>
            <p class="text-base font-bold text-slate-800">{{ KPI_BY_STORE_EXPORT[s.store_id]?.margin_rate || '—' }}</p>
          </div>
        </div>
        <div class="mt-4 pt-4 border-t border-slate-100 flex items-center gap-4 text-[10px] text-slate-500">
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded bg-emerald-500"></span>健康 ≥ 13%</span>
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded bg-amber-400"></span>关注 12-13%</span>
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded bg-orange-400"></span>偏低 &lt; 12%</span>
        </div>
      </section>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section class="lg:col-span-2 space-y-4">
          <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <span class="w-1.5 h-5 bg-red-500 rounded"></span>
            紧急建议（按信心等级排序，跨区域汇总）
          </h2>
          <div v-if="loading" class="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400 text-sm">
            AI 正在分析 ERP 与舆情数据...
          </div>
          <div v-else class="space-y-4">
            <SuggestionCard
              v-for="s in urgentSuggestions"
              :key="s.id"
              :suggestion="s"
              :role="currentRole"
            />
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <span class="w-1.5 h-5 bg-amber-500 rounded"></span>
            全国 + 福建高/中风险 Top 5
          </h2>
          <div class="space-y-2">
            <div
              v-for="r in topRisks"
              :key="r.id"
              class="bg-white rounded-lg border border-slate-200 p-3 hover:shadow-sm transition"
            >
              <div class="flex items-center gap-2 mb-1">
                <RiskBadge :level="r.risk_level" />
                <span class="text-[10px] text-slate-500">{{ r.source }}</span>
              </div>
              <p class="text-xs font-bold text-slate-800 leading-snug line-clamp-2">{{ r.title }}</p>
            </div>
            <div v-if="!topRisks.length" class="bg-white rounded-lg border border-slate-200 p-4 text-center text-xs text-slate-400">
              当前无高/中风险法规
            </div>
          </div>
          <router-link
            to="/regulations"
            class="block text-center text-xs text-emerald-600 hover:text-emerald-700 font-medium py-2"
          >
            查看全部法规 →
          </router-link>
        </section>
      </div>
    </main>
  </div>
</template>
