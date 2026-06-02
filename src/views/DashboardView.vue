<script setup>
import { ref, onMounted, computed } from 'vue'
import { fetchDashboard, fetchDecisions, fetchSentiment } from '@/data'
import AlertTicker from '@/components/AlertTicker.vue'
import KpiCards from '@/components/KpiCards.vue'
import SuggestionCard from '@/components/SuggestionCard.vue'
import InsightCard from '@/components/InsightCard.vue'
import ScriptModal from '@/components/ScriptModal.vue'

const loading = ref(true)
const reportDate = ref('')
const kpi = ref({})
const alerts = ref([])
const urgentSuggestions = ref([])
const topInsights = ref([])

const modalOpen = ref(false)
const modalData = ref({})

function openScript(item) {
  modalData.value = {
    title: item.topic,
    category: item.related_category,
    intro: item.talking_points,
  }
  modalOpen.value = true
}

function openSource(src) {
  if (src?.url) window.open(src.url, '_blank', 'noopener')
}

onMounted(async () => {
  const [d, dec, sent] = await Promise.all([fetchDashboard(), fetchDecisions(), fetchSentiment()])
  reportDate.value = d.report_date
  kpi.value = d.kpiData
  alerts.value = d.alerts
  // 摘要视图：取最紧急 2 条补货建议
  urgentSuggestions.value = dec.restock.slice(0, 2)
  // 5 条舆情
  topInsights.value = sent.items.slice(0, 5)
  loading.value = false
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <AlertTicker :alerts="alerts" />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div class="flex items-end justify-between flex-wrap gap-2">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span class="w-2 h-7 bg-emerald-500 rounded-full"></span>
            战情总览
          </h1>
          <p class="text-xs text-slate-500 mt-1">报告日期 · {{ reportDate }} · 福州鼓楼东街店</p>
        </div>
        <router-link
          to="/decisions"
          class="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-md font-medium transition"
        >
          查看完整决策 →
        </router-link>
      </div>

      <KpiCards :kpi="kpi" />

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section class="lg:col-span-2 space-y-4">
          <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <span class="w-1.5 h-5 bg-red-500 rounded"></span>
            本周最紧急建议
          </h2>

          <div v-if="loading" class="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400 text-sm">
            AI 正在分析 ERP 与舆情数据...
          </div>

          <div v-else class="space-y-4">
            <SuggestionCard
              v-for="s in urgentSuggestions"
              :key="s.id"
              :suggestion="s"
              @open-script="openScript"
              @open-source="openSource"
            />
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <span class="w-1.5 h-5 bg-blue-500 rounded"></span>
            舆情热点 Top 5
          </h2>
          <div class="space-y-3">
            <InsightCard v-for="(it, idx) in topInsights" :key="idx" :insight="it" />
          </div>
          <router-link
            to="/sentiment"
            class="block text-center text-xs text-emerald-600 hover:text-emerald-700 font-medium py-2"
          >
            查看全部舆情 →
          </router-link>
        </section>
      </div>
    </main>

    <ScriptModal :show="modalOpen" :data="modalData" @close="modalOpen = false" />
  </div>
</template>
