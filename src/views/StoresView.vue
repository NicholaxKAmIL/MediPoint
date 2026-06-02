<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { fetchDashboard } from '@/data'
import { currentAccount, currentVisibleStoreIds } from '@/composables/useAuth'
import { useStoreScope } from '@/composables/useStoreScope'
import { STORES, KPI_BY_STORE_EXPORT } from '@/data/mockDashboard'

const { scopeName } = useStoreScope()
const rows = ref([])
const loading = ref(true)
const selectedStoreId = ref(null)
const showModal = ref(false)
const selectedKpi = ref(null)

const visibleStores = computed(() => STORES.filter(s => currentVisibleStoreIds.value.includes(s.store_id)))

const maxMargin = computed(() => {
  const vals = visibleStores.value.map(s => KPI_BY_STORE_EXPORT[s.store_id]?.margin_num || 0)
  return Math.max(15, ...vals)
})

function marginColor(sid) {
  const k = KPI_BY_STORE_EXPORT[sid]
  if (!k) return 'bg-slate-300'
  if (k.margin_status === 'low') return 'bg-orange-400'
  if (k.margin_num >= 13) return 'bg-emerald-500'
  return 'bg-amber-400'
}

function openDetail(sid) {
  selectedStoreId.value = sid
  selectedKpi.value = KPI_BY_STORE_EXPORT[sid]
  showModal.value = true
}

async function load() {
  const account = currentAccount.value
  if (!account) return
  loading.value = true
  const d = await fetchDashboard(account)
  rows.value = d.stores || []
  loading.value = false
}

onMounted(load)
watch(currentAccount, load)
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span class="w-2 h-7 bg-emerald-500 rounded-full"></span>
          门店对比分析
        </h1>
        <p class="text-xs text-slate-500 mt-1">{{ scopeName }} · 可视范围内 {{ visibleStores.length }} 家门店 KPI 对比</p>
      </div>

      <section class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 class="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
          <span class="w-1.5 h-5 bg-emerald-500 rounded"></span>
          毛利率对比柱状图
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div v-for="s in visibleStores" :key="s.store_id" class="text-center">
            <p class="text-xs text-slate-700 font-medium mb-1">{{ s.name }}</p>
            <p class="text-[10px] text-slate-400 mb-3">{{ s.city }} · {{ s.region }}</p>
            <div class="h-40 flex items-end justify-center mb-1">
              <div
                :class="['w-16 rounded-t transition-all', marginColor(s.store_id)]"
                :style="`height: ${((KPI_BY_STORE_EXPORT[s.store_id]?.margin_num || 0) / maxMargin) * 100}%`"
              ></div>
            </div>
            <p class="text-lg font-bold text-slate-800">{{ KPI_BY_STORE_EXPORT[s.store_id]?.margin_rate || '—' }}</p>
            <p class="text-[10px] text-slate-500 mt-1">毛利 ¥{{ KPI_BY_STORE_EXPORT[s.store_id]?.gross_profit || '—' }}</p>
          </div>
        </div>
      </section>

      <section class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-5 py-3 border-b border-slate-100 bg-slate-50">
          <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <span class="w-1.5 h-5 bg-blue-500 rounded"></span>
            门店 KPI 明细
            <span class="text-xs text-slate-400 font-normal ml-1">（点击行查看详情）</span>
          </h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th class="px-4 py-3 text-left">门店</th>
                <th class="px-4 py-3 text-right">今日毛利</th>
                <th class="px-4 py-3 text-right">平均毛利率</th>
                <th class="px-4 py-3 text-right">覆盖率</th>
                <th class="px-4 py-3 text-right">紧急补货数</th>
                <th class="px-4 py-3 text-right">合规率</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="s in visibleStores"
                :key="s.store_id"
                @click="openDetail(s.store_id)"
                class="hover:bg-emerald-50 cursor-pointer transition"
              >
                <td class="px-4 py-3 font-medium text-slate-800">
                  {{ s.name }}
                  <span class="block text-[10px] text-slate-400">{{ s.store_id }} · {{ s.city }} · {{ s.region }}</span>
                </td>
                <td class="px-4 py-3 text-right text-slate-700 font-bold">¥{{ KPI_BY_STORE_EXPORT[s.store_id]?.gross_profit || '—' }}</td>
                <td class="px-4 py-3 text-right">
                  <span :class="KPI_BY_STORE_EXPORT[s.store_id]?.margin_status === 'low' ? 'text-orange-500 font-bold' : 'text-emerald-600 font-bold'">
                    {{ KPI_BY_STORE_EXPORT[s.store_id]?.margin_rate || '—' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right text-slate-700">
                  {{ KPI_BY_STORE_EXPORT[s.store_id]?.coverage_value || '—' }}
                  <span class="block text-[10px] text-slate-400">{{ KPI_BY_STORE_EXPORT[s.store_id]?.coverage_trend || '' }}</span>
                </td>
                <td class="px-4 py-3 text-right">
                  <span class="text-red-600 font-bold">{{ KPI_BY_STORE_EXPORT[s.store_id]?.urgent_count || 0 }}</span>
                </td>
                <td class="px-4 py-3 text-right text-slate-700">{{ KPI_BY_STORE_EXPORT[s.store_id]?.compliance_rate || '—' }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="!visibleStores.length" class="text-center py-10 text-slate-400 text-sm">
          当前账号无权查看任何门店
        </div>
      </section>
    </main>

    <div v-if="showModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" @click.self="showModal = false">
      <div class="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-slate-900">{{ STORES.find(s => s.store_id === selectedStoreId)?.name }} · 详情</h3>
          <button @click="showModal = false" class="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
        </div>
        <div v-if="selectedKpi" class="space-y-3">
          <div class="bg-slate-50 rounded-lg p-3">
            <p class="text-xs text-slate-500">今日毛利</p>
            <p class="text-2xl font-bold text-slate-900">¥{{ selectedKpi.gross_profit }}</p>
          </div>
          <div class="bg-slate-50 rounded-lg p-3">
            <p class="text-xs text-slate-500">平均毛利率</p>
            <p :class="['text-2xl font-bold', selectedKpi.margin_status === 'low' ? 'text-orange-500' : 'text-emerald-600']">
              {{ selectedKpi.margin_rate }}
            </p>
          </div>
          <div class="bg-slate-50 rounded-lg p-3">
            <p class="text-xs text-slate-500">热门商品覆盖率</p>
            <p class="text-2xl font-bold text-slate-900">{{ selectedKpi.coverage_value }}</p>
            <div class="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
              <div class="bg-emerald-500 h-full" :style="`width: ${selectedKpi.coverage_progress}%`"></div>
            </div>
          </div>
          <div class="bg-slate-50 rounded-lg p-3">
            <p class="text-xs text-slate-500">紧急补货数</p>
            <p class="text-2xl font-bold text-red-600">{{ selectedKpi.urgent_count || 0 }}</p>
          </div>
          <div class="bg-slate-50 rounded-lg p-3">
            <p class="text-xs text-slate-500">合规率</p>
            <p class="text-2xl font-bold text-slate-900">{{ selectedKpi.compliance_rate || 0 }}%</p>
          </div>
          <div class="bg-slate-50 rounded-lg p-3">
            <p class="text-xs text-slate-500">热销品类</p>
            <p class="text-base font-bold text-slate-800">{{ selectedKpi.top_category }}</p>
          </div>
        </div>
        <button @click="showModal = false" class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition">
          关闭
        </button>
      </div>
    </div>
  </div>
</template>
