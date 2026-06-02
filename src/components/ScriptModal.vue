<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Object, default: () => ({}) },
  show: { type: Boolean, default: false },
})
const emit = defineEmits(['close'])

const checkpoints = computed(() => {
  return [
    '询问顾客症状持续天数',
    '确认是否有药物过敏史',
    '若为儿童，请按体重计算剂量',
    '提醒禁忌人群 (孕妇 / 司机 / 慢性病)',
  ]
})

const upsellMap = {
  感冒: '建议搭配：维 C 泡腾片 / 复方感冒灵',
  退烧: '建议搭配：电子体温计 + 退热贴',
  过敏: '建议搭配：空气净化器滤芯 / 生理盐水鼻喷',
  肠胃: '建议搭配：益生菌 / 口服补液盐',
  default: '建议搭配：维 C 泡腾片 (提升免疫力)',
}

const upsell = computed(() => {
  const cat = props.data?.category || ''
  for (const k of Object.keys(upsellMap)) {
    if (cat.includes(k)) return upsellMap[k]
  }
  return upsellMap.default
})
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4 backdrop-blur-sm" @click.self="emit('close')">
    <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
      <div class="bg-emerald-600 px-6 py-4 flex justify-between items-center">
        <h3 class="text-white font-bold text-lg flex items-center gap-2">
          <span>💊</span> 药师 AI 卫教助手
        </h3>
        <button @click="emit('close')" class="text-white/80 hover:text-white text-xl leading-none">×</button>
      </div>
      <div class="p-6 space-y-4">
        <div>
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wide">主题</span>
          <h4 class="text-xl font-bold text-slate-900">{{ data.title || '用药建议' }}</h4>
          <span class="text-sm text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mt-1 inline-block">
            {{ data.category || '常规' }}
          </span>
        </div>

        <div class="bg-slate-50 p-4 rounded-lg border border-slate-100">
          <h5 class="text-sm font-bold text-slate-700 mb-2">🩺 问诊检查点</h5>
          <ul class="space-y-2">
            <li v-for="(p, idx) in checkpoints" :key="idx" class="flex items-start gap-2 text-sm text-slate-600">
              <span class="text-emerald-500 mt-0.5">✓</span>{{ p }}
            </li>
          </ul>
        </div>

        <div>
          <h5 class="text-sm font-bold text-slate-700 mb-1">💬 建议话术</h5>
          <p class="text-sm text-slate-600 leading-relaxed bg-white border border-emerald-100 p-3 rounded-lg shadow-sm">
            "{{ data.intro || '请根据顾客症状，结合店内 OTC 目录推荐合适药品。' }}"
          </p>
        </div>

        <div class="pt-2 border-t border-slate-100">
          <p class="text-xs font-bold text-orange-600 flex items-center gap-1">🔥 {{ upsell }}</p>
        </div>

        <button @click="emit('close')" class="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">
          我知道了
        </button>
      </div>
    </div>
  </div>
</template>
