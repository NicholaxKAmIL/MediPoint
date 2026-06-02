<script setup>
const props = defineProps({
  level: { type: String, default: 'Medium' }, // High | Medium | Low
})
const palette = {
  High: 'bg-red-100 text-red-700 border-red-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  Low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}
const labelMap = { High: '高风险', Medium: '中风险', Low: '低风险' }
</script>

<template>
  <span :class="`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${palette[level] || palette.Medium}`">
    {{ labelMap[level] || level }}
  </span>
</template>
