<script setup>
import { computed } from 'vue'

const props = defineProps({
  insight: { type: Object, required: true },
})

const sourceMap = {
  Weibo: { label: '微博', cls: 'bg-red-100 text-red-700' },
  Xiaohongshu: { label: '小红书', cls: 'bg-pink-100 text-pink-700' },
  GovNotice: { label: '政府公告', cls: 'bg-blue-100 text-blue-700' },
}
const tag = computed(() => sourceMap[props.insight.source] || sourceMap.Weibo)

const sentimentMap = {
  positive: { label: '正面', cls: 'bg-emerald-50 text-emerald-600' },
  neutral: { label: '中性', cls: 'bg-slate-100 text-slate-600' },
  concern: { label: '关注', cls: 'bg-amber-50 text-amber-600' },
  negative: { label: '负面', cls: 'bg-red-50 text-red-600' },
}
const sent = computed(() => sentimentMap[props.insight.sentiment] || sentimentMap.neutral)
</script>

<template>
  <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition">
    <div class="flex items-center justify-between mb-2 flex-wrap gap-2">
      <div class="flex items-center gap-2">
        <span :class="`text-[10px] font-bold px-2 py-0.5 rounded ${tag.cls}`">{{ tag.label }}</span>
        <span :class="`text-[10px] px-1.5 py-0.5 rounded ${sent.cls}`">● {{ sent.label }}</span>
      </div>
      <span class="text-[10px] text-slate-400">{{ (insight.crawled_at || '').slice(0, 10) || '今日' }}</span>
    </div>
    <h4 class="text-sm font-bold text-slate-800 mb-1 leading-snug">
      <a :href="insight.url" target="_blank" rel="noopener noreferrer" class="hover:text-emerald-600">
        {{ insight.title }}
      </a>
    </h4>
    <p class="text-xs text-slate-500 leading-relaxed mb-2 line-clamp-2">{{ insight.content }}</p>
    <div class="flex flex-wrap gap-1">
      <span v-for="t in insight.tags" :key="t" class="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">#{{ t }}</span>
    </div>
  </div>
</template>
