<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchRegulations } from '@/data'
import { REGULATION_SOURCES } from '@/data/mockRegulations'
import RiskBadge from '@/components/RiskBadge.vue'

const loading = ref(true)
const items = ref([])
const activeSource = ref('All')
const expandedId = ref(null)

const filtered = computed(() => {
  if (activeSource.value === 'All') return items.value
  return items.value.filter(i => i.source === activeSource.value)
})

const counts = computed(() => {
  const c = { High: 0, Medium: 0, Low: 0 }
  for (const it of items.value) c[it.risk_level] = (c[it.risk_level] || 0) + 1
  return c
})

function toggle(id) {
  expandedId.value = expandedId.value === id ? null : id
}

onMounted(async () => {
  const d = await fetchRegulations()
  items.value = d.items
  loading.value = false
})

const sourceLabel = (s) => ({
  'NMPA': 'NMPA',
  '福建卫健委': '福建卫健委',
  '福建 CDC': '福建 CDC',
}[s] || s)
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span class="w-2 h-7 bg-amber-500 rounded-full"></span>
          法规政策通告
        </h1>
        <p class="text-xs text-slate-500 mt-1">NMPA · 福建卫健委 · 福建 CDC — 合规风险一目了然</p>
      </div>

      <div class="grid grid-cols-3 gap-3">
        <div class="bg-white rounded-xl border border-slate-200 p-3 text-center">
          <p class="text-2xl font-bold text-red-600">{{ counts.High }}</p>
          <p class="text-[10px] text-slate-500 mt-1">高风险</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-3 text-center">
          <p class="text-2xl font-bold text-amber-600">{{ counts.Medium }}</p>
          <p class="text-[10px] text-slate-500 mt-1">中风险</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-3 text-center">
          <p class="text-2xl font-bold text-emerald-600">{{ counts.Low }}</p>
          <p class="text-[10px] text-slate-500 mt-1">低风险</p>
        </div>
      </div>

      <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          v-for="src in REGULATION_SOURCES"
          :key="src"
          @click="activeSource = src"
          :class="`px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap border ${
            activeSource === src
              ? 'bg-slate-800 text-white border-slate-800 shadow-md'
              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
          }`"
        >
          {{ src === 'All' ? '全部' : sourceLabel(src) }}
        </button>
      </div>

      <section v-if="loading" class="text-center text-slate-400 py-10 text-sm">加载中...</section>

      <section v-else class="space-y-3">
        <div
          v-for="item in filtered"
          :key="item.id"
          class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition"
        >
          <div
            @click="toggle(item.id)"
            class="p-4 flex items-start gap-3 cursor-pointer"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {{ sourceLabel(item.source) }}
                </span>
                <RiskBadge :level="item.risk_level" />
                <span class="text-[10px] text-slate-400">{{ item.published_at }}</span>
              </div>
              <h3 class="text-sm font-bold text-slate-800 leading-snug">{{ item.title }}</h3>
              <p class="text-xs text-slate-500 mt-1 line-clamp-2">{{ item.summary }}</p>
            </div>
            <span class="text-slate-400 text-lg flex-shrink-0">{{ expandedId === item.id ? '▾' : '▸' }}</span>
          </div>

          <div v-if="expandedId === item.id" class="border-t border-slate-100 bg-slate-50 p-4 space-y-3 text-sm">
            <div>
              <p class="text-xs font-bold text-slate-500 mb-1">全文摘要</p>
              <p class="text-slate-700 leading-relaxed">{{ item.summary }}</p>
            </div>
            <div>
              <p class="text-xs font-bold text-slate-500 mb-1">影响品类</p>
              <div class="flex flex-wrap gap-1">
                <span v-for="c in item.affected_categories" :key="c" class="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded">
                  {{ c }}
                </span>
              </div>
            </div>
            <div>
              <p class="text-xs font-bold text-slate-500 mb-1">建议应对措施</p>
              <p class="text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                ✅ {{ item.response }}
              </p>
            </div>
          </div>
        </div>

        <div v-if="filtered.length === 0" class="text-center py-10 text-slate-400 text-sm">该来源暂无通告</div>
      </section>
    </main>
  </div>
</template>
