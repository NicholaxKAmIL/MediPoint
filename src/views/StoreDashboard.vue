<script setup>
import { ref, computed } from 'vue'
import { fetchDashboard, fetchDecisions, fetchRegulations } from '@/data'
import { currentAccount, currentRole } from '@/composables/useAuth'
import { useStoreScope } from '@/composables/useStoreScope'
import { useScopedLoader } from '@/composables/useScopedLoader'
import AlertTicker from '@/components/AlertTicker.vue'
import KpiCards from '@/components/KpiCards.vue'
import SuggestionCard from '@/components/SuggestionCard.vue'
import ScriptModal from '@/components/ScriptModal.vue'
import AIChatPanel from '@/components/AIChatPanel.vue'
import RiskBadge from '@/components/RiskBadge.vue'

const { scopeName } = useStoreScope()

const reportDate = ref('')
const kpi = ref({})
const alerts = ref([])
const todaySuggestions = ref([])
const localRegs = ref([])

const modalOpen = ref(false)
const modalData = ref({})

function openScript(item) {
  modalData.value = {
    title: item.topic,
    category: item.related_category,
    action: item.action,
    confidence: item.confidence,
    talking_points: item.talking_points,
    reason: item.reason,
    items: item.items,
    sources: item.sources,
  }
  modalOpen.value = true
}

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
    todaySuggestions.value = dec.restock.slice(0, 2).concat(dec.promotion.slice(0, 1))
    localRegs.value = reg.items
      .filter(r => r.risk_level === 'High' || r.risk_level === 'Medium')
      .slice(0, 3)
  },
  { watchSource: currentAccount }
)

const storeName = computed(() => scopeName.value)
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <AlertTicker :alerts="alerts" />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div class="flex items-end justify-between flex-wrap gap-2">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span class="w-2 h-7 bg-emerald-500 rounded-full"></span>
            门店今日速报
          </h1>
          <p class="text-xs text-slate-500 mt-1">报告日期 · {{ reportDate }} · {{ storeName }}</p>
        </div>
        <router-link
          to="/chat"
          class="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-md font-medium transition"
        >
          打开 AI 咨询 →
        </router-link>
      </div>

      <KpiCards :kpi="kpi" />

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section class="space-y-3">
          <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <span class="w-1.5 h-5 bg-red-500 rounded"></span>
            今日建议 ({{ todaySuggestions.length }})
          </h2>
          <div v-if="loading" class="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
            加载中...
          </div>
          <div v-else class="space-y-3">
            <SuggestionCard
              v-for="s in todaySuggestions"
              :key="s.id"
              :suggestion="s"
              :role="currentRole"
              @open-script="openScript"
            />
          </div>
        </section>

        <section>
          <AIChatPanel
            size="lg"
            title="门店 AI 客户咨询"
            subtitle="实时用药助手 · 本店 FAQ 优先"
          />
        </section>
      </div>

      <section class="space-y-3">
        <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
          <span class="w-1.5 h-5 bg-amber-500 rounded"></span>
          本店相关法规速查
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div
            v-for="r in localRegs"
            :key="r.id"
            class="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-sm transition"
          >
            <div class="flex items-center gap-2 mb-2">
              <RiskBadge :level="r.risk_level" />
              <span class="text-[10px] text-slate-500">{{ r.source }}</span>
            </div>
            <p class="text-xs font-bold text-slate-800 leading-snug mb-2 line-clamp-2">{{ r.title }}</p>
            <p class="text-[11px] text-slate-500 leading-relaxed line-clamp-2">✅ {{ r.response }}</p>
          </div>
        </div>
        <router-link
          to="/regulations"
          class="block text-center text-xs text-emerald-600 hover:text-emerald-700 font-medium py-2"
        >
          查看全部法规 →
        </router-link>
      </section>
    </main>

    <ScriptModal :show="modalOpen" :data="modalData" :role="currentRole" @close="modalOpen = false" />
  </div>
</template>
