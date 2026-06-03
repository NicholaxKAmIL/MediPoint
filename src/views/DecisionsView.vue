<script setup>
import { ref } from 'vue'
import { fetchDecisions } from '@/data'
import { currentAccount, currentRole } from '@/composables/useAuth'
import { useStoreScope } from '@/composables/useStoreScope'
import { useScopedLoader } from '@/composables/useScopedLoader'
import { STORES } from '@/data/mockDashboard'
import SuggestionCard from '@/components/SuggestionCard.vue'
import ScriptModal from '@/components/ScriptModal.vue'

const { scopeName } = useStoreScope()

const reportDate = ref('')
const restock = ref([])
const promotion = ref([])

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
function openSource(src) {
  if (src?.url && src.url !== '#') {
    const w = window.open(src.url, '_blank')
    if (w) w.opener = null
  }
}

const toast = ref('')
let toastTimer = null
function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ''), 2500)
}

function storeNameOf(s) {
  return STORES.find(x => x.store_id === s.store_id)?.name || s.region || '本店'
}

function exportCsv() {
  const headers = ['编号', '门店', '行动', '主题', '关联品类', 'SKU', '商品名', '当前库存', '毛利率', '话术']
  const rows = [headers.join(',')]
  for (const s of [...restock.value, ...promotion.value]) {
    const sn = storeNameOf(s)
    for (const it of s.items) {
      rows.push([
        s.id, sn, s.action === 'Restock' ? '补货' : '促销', s.topic, s.related_category,
        it.sku_id, `"${it.name}"`, it.stock, `${it.margin}%`, `"${s.talking_points.replace(/"/g, '""')}"`,
      ].join(','))
    }
  }
  const csv = '\uFEFF' + rows.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `MediPoint_${scopeName.value}_采购单_${reportDate.value}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 0)
  showToast('CSV 采购单已下载')
}

async function exportPdf() {
  showToast('PDF 正在生成中…')
  setTimeout(() => window.print(), 300)
}

const { loading } = useScopedLoader(
  () => fetchDecisions(currentAccount.value),
  (d) => {
    if (!d) return
    reportDate.value = d.date
    restock.value = d.restock
    promotion.value = d.promotion
  },
  { watchSource: currentAccount }
)
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6" id="printable">
      <div class="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span class="w-2 h-7 bg-red-500 rounded-full"></span>
            AI 采购决策
          </h1>
          <p class="text-xs text-slate-500 mt-1">报告日期 · {{ reportDate }} · {{ scopeName }}</p>
        </div>
        <div class="flex gap-2">
          <button @click="exportPdf" class="text-xs bg-white border border-slate-300 px-3 py-2 rounded-md font-medium hover:bg-slate-50">
            🖨️ 导出 PDF
          </button>
          <button @click="exportCsv" class="text-xs bg-emerald-600 text-white px-3 py-2 rounded-md font-medium hover:bg-emerald-700">
            ⬇️ 导出 CSV
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2 flex-wrap text-xs">
        <span class="px-2 py-1 rounded-full bg-slate-200 text-slate-700 font-medium">范围：{{ scopeName }}</span>
        <span class="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">当前角色：{{ currentRole }}</span>
      </div>

      <section v-if="loading" class="text-center text-slate-400 py-10 text-sm">加载中...</section>

      <template v-else>
        <section class="space-y-3">
          <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <span class="w-1.5 h-5 bg-red-500 rounded"></span>
            补货建议 <span class="text-xs text-slate-400 font-normal">({{ restock.length }} 条)</span>
          </h2>
          <SuggestionCard
            v-for="s in restock"
            :key="s.id"
            :suggestion="s"
            :role="currentRole"
            @open-script="openScript"
            @open-source="openSource"
          />
        </section>

        <section class="space-y-3">
          <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <span class="w-1.5 h-5 bg-blue-500 rounded"></span>
            促销建议 <span class="text-xs text-slate-400 font-normal">({{ promotion.length }} 条)</span>
          </h2>
          <SuggestionCard
            v-for="s in promotion"
            :key="s.id"
            :suggestion="s"
            :role="currentRole"
            @open-script="openScript"
            @open-source="openSource"
          />
        </section>
      </template>
    </main>

    <ScriptModal :show="modalOpen" :data="modalData" :role="currentRole" @close="modalOpen = false" />

    <div v-if="toast" class="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-2.5 rounded-lg shadow-lg text-sm z-50">
      {{ toast }}
    </div>
  </div>
</template>

<style>
@media print {
  body * { visibility: hidden; }
  #printable, #printable * { visibility: visible; }
  #printable { position: absolute; left: 0; top: 0; width: 100%; }
  button, nav, header { display: none !important; }
}
</style>
