<script setup>
import { computed } from 'vue'
import ConfidenceBadge from './ConfidenceBadge.vue'

const props = defineProps({
  suggestion: { type: Object, required: true },
})
const emit = defineEmits(['open-script', 'open-source'])

const actionStyle = computed(() =>
  props.suggestion.action === 'Restock'
    ? { tag: '建议补货', tagClass: 'bg-red-100 text-red-700', cardClass: 'border-red-200' }
    : { tag: '行销推广', tagClass: 'bg-blue-100 text-blue-700', cardClass: 'border-blue-200' }
)

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
        </div>
        <p class="text-sm text-slate-600">{{ suggestion.reason }}</p>
        <div v-if="suggestion.sources?.length" class="mt-2 flex flex-wrap gap-1">
          <button
            v-for="(s, idx) in suggestion.sources"
            :key="idx"
            @click="emit('open-source', s)"
            class="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 hover:border-emerald-300 hover:text-emerald-700 transition"
          >
            📎 {{ s.label }}
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

      <div
        @click="emit('open-script', suggestion)"
        class="mt-4 bg-emerald-50 rounded-lg p-3 flex gap-3 items-start cursor-pointer hover:bg-emerald-100 transition-colors border border-transparent hover:border-emerald-200"
      >
        <span class="text-yellow-500 text-xl leading-none flex-shrink-0">💡</span>
        <div class="w-full">
          <div class="flex justify-between items-center">
            <span class="text-xs font-bold text-emerald-700 uppercase">药师销售话术 (点击查看详情)</span>
            <span class="text-emerald-600">›</span>
          </div>
          <p class="text-sm text-emerald-900 mt-1 leading-relaxed">{{ suggestion.talking_points }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
