<script setup>
defineProps({
  kpi: { type: Object, required: true },
})
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div class="flex justify-between items-start">
        <p class="text-xs text-slate-500 font-medium">{{ kpi.coverage_label }}</p>
        <span class="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">Top 20</span>
      </div>
      <div class="flex items-end gap-2 mt-1">
        <span class="text-2xl font-bold text-slate-900">{{ kpi.coverage_value }}</span>
        <span class="text-xs font-bold mb-1 text-emerald-600">{{ kpi.coverage_trend }}</span>
      </div>
      <div class="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
        <div class="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000" :style="`width: ${kpi.coverage_progress}%`"></div>
      </div>
    </div>

    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <p class="text-xs text-slate-500 font-medium">今日毛利额</p>
      <div class="flex items-end gap-2 mt-1">
        <span class="text-2xl font-bold text-slate-900">¥{{ kpi.gross_profit }}</span>
      </div>
    </div>

    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <p class="text-xs text-slate-500 font-medium">平均毛利率</p>
      <div class="flex items-end gap-2 mt-1">
        <span :class="`text-2xl font-bold ${kpi.margin_status === 'low' ? 'text-orange-500' : 'text-emerald-600'}`">
          {{ kpi.margin_rate }}
        </span>
        <span class="text-xs text-slate-400 mb-1">偏低</span>
      </div>
    </div>

    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <p class="text-xs text-slate-500 font-medium">热销品类</p>
      <div class="flex items-end gap-2 mt-1">
        <span class="text-xl font-bold text-slate-900">{{ kpi.top_category }}</span>
      </div>
    </div>
  </div>
</template>
