<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import ConfidenceBadge from './ConfidenceBadge.vue'
import { fetchDecisionScript } from '@/composables/useStoreData'

const props = defineProps({
  suggestion: { type: Object, required: true },
  role: { type: String, default: '' },
})
const emit = defineEmits(['open-script', 'open-source'])

const isPharmacist = computed(() => props.role === '门店药师')

const actionStyle = computed(() =>
  props.suggestion.action === 'Restock'
    ? { tag: '建议补货', tagClass: 'bg-red-100 text-red-700', cardClass: 'border-red-200' }
    : { tag: '行销推广', tagClass: 'bg-blue-100 text-blue-700', cardClass: 'border-blue-200' }
)

const localTalkingPoints = ref(props.suggestion.talking_points)
const localReason = ref(props.suggestion.reason)
const localUpsell = ref(props.suggestion.upsell)
const scriptLoading = ref(false)

async function loadScript() {
  if (localTalkingPoints.value) return
  if (!props.suggestion.script_key) return
  scriptLoading.value = true
  const data = await fetchDecisionScript(props.suggestion.script_key)
  scriptLoading.value = false
  if (data) {
    if (data.talking_points) localTalkingPoints.value = data.talking_points
    if (data.reason) localReason.value = data.reason
    if (data.upsell) localUpsell.value = data.upsell
  }
}

onMounted(loadScript)
watch(() => props.suggestion.script_key, loadScript)

function openDetail() {
  emit('open-script', {
    ...props.suggestion,
    talking_points: localTalkingPoints.value,
    reason: localReason.value,
    upsell: localUpsell.value,
  })
}

function stockStatus(qty) {
  if (qty <= 30) return { label: '急需进货', dot: 'bg-red-500', text: 'text-red-600' }
  if (qty <= 60) return { label: '库存偏低', dot: 'bg-amber-500', text: 'text-amber-600' }
  if (qty >= 150) return { label: '库存积压', dot: 'bg-blue-500', text: 'text-blue-600' }
  return { label: '库存充足', dot: 'bg-emerald-500', text: 'text-emerald-600' }
}

function marginColor(m) {
  if (m >= 30) return 'text-emerald-600 bg-emerald-50 border-emerald-100'
  if (m >= 15) return 'text-amber-600 bg-amber-50 border-amber-200'
  return 'text-red-600 bg-red-50 border-red-200'
}

const highRiskAlertCount = computed(() =>
  (props.suggestion.sources || []).filter(s => s.type === 'alert' && s.risk_level === 'High').length
)
</script>

<template>
  <div :class="`bg-white rounded-xl border ${actionStyle.cardClass} shadow-sm overflow-hidden hover:shadow-md transition-all`">
    <div class="p-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-2 flex-wrap">
          <span :class="`px-2.5 py-1 rounded-md text-xs font-bold ${actionStyle.tagClass}`">
            {{ actionStyle.tag }}
          </span>
          <h3 class="text-base font-bold text-slate-800">{{ suggestion.topic }}</h3>
          <ConfidenceBadge :level="suggestion.confidence" />
          <span v-if="highRiskAlertCount > 0" class="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
            🔔 {{ highRiskAlertCount }} 条高风险公告
          </span>
        </div>
        <p v-if="localReason" class="text-sm text-slate-600">{{ localReason }}</p>
        <p v-else-if="scriptLoading" class="text-sm text-slate-400 italic">AI 分析中...</p>
        <div v-if="suggestion.sources?.length" class="mt-2 flex flex-wrap gap-1">
          <button
            v-for="(s, idx) in suggestion.sources"
            :key="idx"
            @click="emit('open-source', s)"
            :class="[
              'text-[10px] px-2 py-0.5 rounded border transition',
              s.type === 'alert'
                ? 'text-red-700 bg-red-50 border-red-200 hover:border-red-400 font-medium'
                : 'text-slate-500 bg-white border-slate-200 hover:border-emerald-300 hover:text-emerald-700',
            ]"
          >
            {{ s.type === 'alert' ? '🔔' : '📎' }} {{ s.label }}
          </button>
        </div>
      </div>
      <div class="text-right ml-4 flex-shrink-0">
        <span class="text-xs text-slate-400 block mb-1">关联品类</span>
        <span class="text-sm font-medium text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">
          {{ suggestion.related_category }}
        </span>
      </div>
    </div>

    <div class="p-5">
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
            <tr>
              <th class="px-2 py-2">商品名称 (SKU)</th>
              <th class="px-2 py-2">当前库存</th>
              <th class="px-2 py-2">毛利率</th>
              <th class="px-2 py-2 text-right">状态</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="sku in suggestion.items" :key="sku.sku_id" class="hover:bg-slate-50">
              <td class="px-2 py-3 font-medium text-slate-800">
                {{ sku.name }}
                <span class="block text-[10px] text-slate-400 font-normal">{{ sku.sku_id }}</span>
              </td>
              <td class="px-2 py-3">
                <div class="flex items-center gap-2">
                  <span :class="`w-2 h-2 rounded-full ${stockStatus(sku.stock).dot}`"></span>
                  <span :class="`${stockStatus(sku.stock).text} font-bold`">{{ sku.stock }}</span>
                  <span class="text-[10px] text-slate-400">/ 盒</span>
                </div>
              </td>
              <td class="px-2 py-3">
                <span :class="`px-2 py-0.5 rounded text-xs font-medium border ${marginColor(sku.margin)}`">
                  {{ sku.margin }}%
                </span>
              </td>
              <td class="px-2 py-3 text-right">
                <span :class="`text-xs font-bold ${stockStatus(sku.stock).text}`">
                  {{ stockStatus(sku.stock).label }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 药师版: 行销话术 (绿色面板) -->
      <div
        v-if="isPharmacist"
        @click="openDetail"
        class="mt-4 bg-emerald-50 rounded-lg p-3 flex gap-3 items-start cursor-pointer hover:bg-emerald-100 transition-colors border border-transparent hover:border-emerald-200"
      >
        <span class="text-yellow-500 text-xl leading-none flex-shrink-0">💡</span>
        <div class="w-full">
          <div class="flex justify-between items-center">
            <span class="text-xs font-bold text-emerald-700 uppercase">药师行销话术 (点击查看详情)</span>
            <span class="text-emerald-600">›</span>
          </div>
          <p v-if="localTalkingPoints" class="text-sm text-emerald-900 mt-1 leading-relaxed">{{ localTalkingPoints }}</p>
          <p v-else-if="scriptLoading" class="text-sm text-emerald-700/60 mt-1 italic flex items-center gap-2">
            <span class="inline-block w-3 h-3 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin"></span>
            AI 正在生成行销建议...
          </p>
          <p v-else class="text-sm text-slate-400 mt-1 italic">暂无可用话术</p>
        </div>
      </div>

      <!-- 督导/管理者版: 采购补货建议 (蓝色面板) -->
      <div
        v-else
        @click="openDetail"
        class="mt-4 bg-blue-50 rounded-lg p-3 flex gap-3 items-start cursor-pointer hover:bg-blue-100 transition-colors border border-transparent hover:border-blue-200"
      >
        <span class="text-blue-500 text-xl leading-none flex-shrink-0">📦</span>
        <div class="w-full">
          <div class="flex justify-between items-center">
            <span class="text-xs font-bold text-blue-700 uppercase">基于舆情的采购补货建议 (点击查看详情)</span>
            <span class="text-blue-600">›</span>
          </div>
          <p v-if="localReason" class="text-sm text-blue-900 mt-1 leading-relaxed line-clamp-2">{{ localReason }}</p>
          <p v-else-if="scriptLoading" class="text-sm text-blue-700/60 mt-1 italic flex items-center gap-2">
            <span class="inline-block w-3 h-3 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></span>
            AI 正在分析舆情与库存...
          </p>
          <p v-else class="text-sm text-slate-400 mt-1 italic">暂无建议</p>
        </div>
      </div>
    </div>
  </div>
</template>
