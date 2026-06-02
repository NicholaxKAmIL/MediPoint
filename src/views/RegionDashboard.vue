<script setup>
import { ref } from 'vue'
import { fetchDashboard, fetchDecisions, fetchRegulations } from '@/data'
import { currentAccount } from '@/composables/useAuth'
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
const regionRegs = ref([])
const pendingApprovals = ref([])

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
    const account = currentAccount.value
    reportDate.value = d.report_date
    kpi.value = d.kpiData
    alerts.value = d.alerts
    regionRegs.value = reg.items
      .filter(r => r.regions?.includes(account.cities?.[0]?.replace('市', '') || '福建'))
      .slice(0, 4)
    pendingApprovals.value = dec.restock.filter(s => s.confidence !== 'A').slice(0, 3)
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
            区域战情总览
          </h1>
          <p class="text-xs text-slate-500 mt-1">报告日期 · {{ reportDate }} · {{ scopeName }}（{{ stores.length }} 店）</p>
        </div>
        <router-link
          to="/decisions"
          class="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-md font-medium transition"
        >
          查看区域决策 →
        </router-link>
      </div>

      <KpiCards :kpi="kpi" />

      <section class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 class="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
          <span class="w-1.5 h-5 bg-emerald-500 rounded"></span>
          区域内门店对比
        </h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th class="px-3 py-2 text-left">门店</th>
                <th class="px-3 py-2 text-right">今日毛利</th>
                <th class="px-3 py-2 text-right">平均毛利率</th>
                <th class="px-3 py-2 text-right">覆盖率</th>
                <th class="px-3 py-2 text-right">紧急数</th>
                <th class="px-3 py-2 text-right">合规率</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="s in stores" :key="s.store_id" class="hover:bg-slate-50">
                <td class="px-3 py-3 font-medium text-slate-800">
                  {{ s.name }}
                  <span class="block text-[10px] text-slate-400">{{ s.city }} · {{ s.region }}</span>
                </td>
                <td class="px-3 py-3 text-right text-slate-700">¥{{ KPI_BY_STORE_EXPORT[s.store_id]?.gross_profit || '—' }}</td>
                <td class="px-3 py-3 text-right">
                  <span :class="KPI_BY_STORE_EXPORT[s.store_id]?.margin_status === 'low' ? 'text-orange-500 font-bold' : 'text-emerald-600 font-bold'">
                    {{ KPI_BY_STORE_EXPORT[s.store_id]?.margin_rate || '—' }}
                  </span>
                </td>
                <td class="px-3 py-3 text-right text-slate-700">{{ KPI_BY_STORE_EXPORT[s.store_id]?.coverage_value || '—' }}</td>
                <td class="px-3 py-3 text-right">
                  <span class="text-red-600 font-bold">{{ KPI_BY_STORE_EXPORT[s.store_id]?.urgent_count || 0 }}</span>
                </td>
                <td class="px-3 py-3 text-right text-slate-700">{{ KPI_BY_STORE_EXPORT[s.store_id]?.compliance_rate || '—' }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section class="space-y-4">
          <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <span class="w-1.5 h-5 bg-red-500 rounded"></span>
            待审核事项 <span class="text-xs text-slate-400 font-normal">({{ pendingApprovals.length }})</span>
          </h2>
          <div v-if="loading" class="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
            加载中...
          </div>
          <div v-else-if="!pendingApprovals.length" class="bg-white rounded-xl border border-slate-200 p-8 text-center text-emerald-600 text-sm font-medium">
            ✅ 当前无待审核事项
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="s in pendingApprovals"
              :key="s.id"
              class="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-sm transition"
            >
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <span class="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded">待审核</span>
                <span class="text-sm font-bold text-slate-800">{{ s.topic }}</span>
              </div>
              <p class="text-xs text-slate-500">{{ s.reason }}</p>
              <div class="mt-2 flex gap-2">
                <button class="text-[10px] bg-emerald-600 text-white px-2 py-1 rounded font-bold hover:bg-emerald-700">
                  批准下发
                </button>
                <button class="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold hover:bg-slate-200">
                  暂缓
                </button>
              </div>
            </div>
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <span class="w-1.5 h-5 bg-amber-500 rounded"></span>
            区域相关法规
          </h2>
          <div class="space-y-2">
            <div
              v-for="r in regionRegs"
              :key="r.id"
              class="bg-white rounded-lg border border-slate-200 p-3 hover:shadow-sm transition"
            >
              <div class="flex items-center gap-2 mb-1">
                <RiskBadge :level="r.risk_level" />
                <span class="text-[10px] text-slate-500">{{ r.source }}</span>
              </div>
              <p class="text-xs font-bold text-slate-800 leading-snug line-clamp-2">{{ r.title }}</p>
            </div>
            <div v-if="!regionRegs.length" class="bg-white rounded-lg border border-slate-200 p-4 text-center text-xs text-slate-400">
              当前区域无相关法规
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
