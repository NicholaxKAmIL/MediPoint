<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { fetchSentiment } from '@/data'
import { SENTIMENT_SOURCES } from '@/data/mockSentiment'
import { useAppState } from '@/composables/useStoreData'
import InsightCard from '@/components/InsightCard.vue'

const { appState, currentStore } = useAppState()

const loading = ref(true)
const allItems = ref([])
const keywordTrend = ref([])
const series = ref([])
const activeTab = ref('All')

const storeName = computed(() => currentStore().name)

const sourceLabel = (s) => ({
  All: '全部',
  Weibo: '微博',
  Xiaohongshu: '小红书',
  GovNotice: '政府公告',
}[s] || s)

const tabCounts = computed(() => {
  const c = { All: allItems.value.length, Weibo: 0, Xiaohongshu: 0, GovNotice: 0 }
  for (const it of allItems.value) {
    if (c[it.source] !== undefined) c[it.source]++
  }
  return c
})

const filtered = computed(() => {
  if (activeTab.value === 'All') return allItems.value
  return allItems.value.filter(i => i.source === activeTab.value)
})

async function load(sid) {
  const token = ++loadToken
  loading.value = true
  const d = await fetchSentiment(sid)
  if (token !== loadToken) return
  allItems.value = d.items
  keywordTrend.value = d.keyword_trend
  series.value = d.seven_day_series
  loading.value = false
}

let loadToken = 0
onMounted(() => load(appState.storeId))
watch(() => appState.storeId, (sid) => load(sid))

const maxSeriesValue = computed(() => {
  if (!series.value.length) return 100
  return Math.max(...series.value.flatMap(s => [s.Weibo, s.Xiaohongshu, s.GovNotice]))
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span class="w-2 h-7 bg-blue-500 rounded-full"></span>
          全网舆情监控
        </h1>
        <p class="text-xs text-slate-500 mt-1">微博 · 小红书 · 政府公告 — 实时驱动决策</p>
      </div>

      <div class="flex items-center gap-2 flex-wrap text-xs">
        <span class="px-2 py-1 rounded-full bg-slate-200 text-slate-700 font-medium">当前门店：{{ storeName }}</span>
        <span class="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">当前角色：{{ appState.role }}</span>
        <span class="px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">共 {{ allItems.length }} 条</span>
      </div>

      <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          v-for="tab in SENTIMENT_SOURCES"
          :key="tab"
          @click="activeTab = tab"
          :aria-pressed="activeTab === tab"
          :class="`px-4 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap border duration-150 ${
            activeTab === tab
              ? 'bg-slate-800 text-white border-slate-800 shadow-md ring-2 ring-emerald-400 ring-offset-1'
              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
          }`"
        >
          <span v-if="activeTab === tab">✅ </span>{{ sourceLabel(tab) }} ({{ tabCounts[tab] }})
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section class="lg:col-span-2 space-y-3 transition-opacity duration-200">
          <div v-if="loading" class="text-center text-slate-400 py-10 text-sm">加载中...</div>
          <InsightCard v-for="(it, idx) in filtered" :key="idx" :insight="it" />
          <div v-if="!loading && filtered.length === 0" class="text-center py-10 text-slate-400 text-sm">
            此分类暂无舆情 · 试试切换其他平台
          </div>
        </section>

        <aside class="space-y-4">
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 class="text-sm font-bold text-slate-800 mb-3">关键词热度排行</h3>
            <div class="space-y-2">
              <div v-for="(k, idx) in keywordTrend" :key="k.keyword" class="flex items-center gap-2 text-xs">
                <span class="w-4 text-slate-400 text-right">{{ idx + 1 }}</span>
                <span class="font-medium text-slate-700 w-16 flex-shrink-0">{{ k.keyword }}</span>
                <div class="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div class="bg-emerald-500 h-full" :style="`width: ${k.value}%`"></div>
                </div>
                <span class="text-slate-400 w-8 text-right">{{ k.value }}</span>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 class="text-sm font-bold text-slate-800 mb-3">七日趋势</h3>
            <div class="h-40 flex items-end gap-1 px-1">
              <div v-for="(s, idx) in series" :key="idx" class="flex-1 flex flex-col items-center gap-1">
                <div class="w-full flex flex-col items-stretch gap-0.5 h-32 justify-end">
                  <div class="bg-red-400 rounded-t" :style="`height: ${(s.Weibo / maxSeriesValue) * 100}%`" :title="`微博 ${s.Weibo}`"></div>
                  <div class="bg-pink-400 rounded-t" :style="`height: ${(s.Xiaohongshu / maxSeriesValue) * 100}%`" :title="`小红书 ${s.Xiaohongshu}`"></div>
                  <div class="bg-blue-500 rounded-t" :style="`height: ${(s.GovNotice / maxSeriesValue) * 100}%`" :title="`公告 ${s.GovNotice}`"></div>
                </div>
                <span class="text-[9px] text-slate-400">{{ s.date }}</span>
              </div>
            </div>
            <div class="flex justify-center gap-3 mt-3 text-[10px] text-slate-500">
              <span class="flex items-center gap-1"><span class="w-2 h-2 bg-red-400 rounded"></span>微博</span>
              <span class="flex items-center gap-1"><span class="w-2 h-2 bg-pink-400 rounded"></span>小红书</span>
              <span class="flex items-center gap-1"><span class="w-2 h-2 bg-blue-500 rounded"></span>政府公告</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  </div>
</template>
