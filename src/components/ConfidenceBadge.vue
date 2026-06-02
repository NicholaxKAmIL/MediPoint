<script setup>
const props = defineProps({
  level: { type: String, default: 'B' }, // A | B | C
})
const palette = {
  A: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  B: 'bg-amber-100 text-amber-700 border-amber-200',
  C: 'bg-slate-100 text-slate-600 border-slate-200',
}
const labelMap = { A: 'A 高信心', B: 'B 中信心', C: 'C 参考' }
</script>

<template>
  <span :class="`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${palette[level] || palette.C}`">
    <span class="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
    {{ labelMap[level] || level }}
  </span>
</template>
