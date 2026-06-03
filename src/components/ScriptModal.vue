<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Object, default: () => ({}) },
  show: { type: Boolean, default: false },
  role: { type: String, default: '' },
})
const emit = defineEmits(['close'])

const isPharmacist = computed(() => props.role === '门店药师')

const pharmacistCheckpoints = [
  '询问顾客症状持续天数',
  '确认是否有药物过敏史',
  '若为儿童，请按体重计算剂量',
  '提醒禁忌人群 (孕妇 / 司机 / 慢性病)',
]

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

const alertSources = computed(() =>
  (props.data?.sources || []).filter(s => s.type === 'alert')
)
</script>

<template>
  <!-- 药师版: AI 卫教助手 -->
  <div
    v-if="show && isPharmacist"
    class="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4 backdrop-blur-sm"
    @click.self="emit('close')"
  >
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
            <li
              v-for="(p, idx) in pharmacistCheckpoints"
              :key="idx"
              class="flex items-start gap-2 text-sm text-slate-600"
            >
              <span class="text-emerald-500 mt-0.5">✓</span>{{ p }}
            </li>
          </ul>
        </div>

        <div>
          <h5 class="text-sm font-bold text-slate-700 mb-1">💬 建议话术</h5>
          <p class="text-sm text-slate-600 leading-relaxed bg-white border border-emerald-100 p-3 rounded-lg shadow-sm">
            "{{ data.talking_points || data.intro || '请根据顾客症状，结合店内 OTC 目录推荐合适药品。' }}"
          </p>
        </div>

        <div class="pt-2 border-t border-slate-100">
          <p class="text-xs font-bold text-orange-600 flex items-center gap-1">🔥 {{ upsell }}</p>
        </div>

        <button
          @click="emit('close')"
          class="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
        >
          我知道了
        </button>
      </div>
    </div>
  </div>

  <!-- 督导/管理者版: 采购补货详情 -->
  <div
    v-else-if="show"
    class="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4 backdrop-blur-sm"
    @click.self="emit('close')"
  >
    <div class="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
      <div class="bg-blue-600 px-6 py-4 flex justify-between items-center flex-shrink-0">
        <h3 class="text-white font-bold text-lg flex items-center gap-2">
          <span>📦</span> 采购补货决策详情
        </h3>
        <button @click="emit('close')" class="text-white/80 hover:text-white text-xl leading-none">×</button>
      </div>
      <div class="p-6 space-y-4 overflow-y-auto">
        <div class="flex items-start justify-between gap-3">
          <div>
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wide">主题</span>
            <h4 class="text-xl font-bold text-slate-900">{{ data.title || '采购建议' }}</h4>
            <div class="mt-2 flex items-center gap-2 flex-wrap">
              <span class="text-sm text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {{ data.category || '常规' }}
              </span>
              <span
                v-if="data.action === 'Restock'"
                class="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded"
              >建议补货</span>
              <span
                v-else
                class="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded"
              >行销推广</span>
            </div>
          </div>
          <div v-if="data.confidence" class="text-right flex-shrink-0">
            <span class="text-xs text-slate-400 block">信心等级</span>
            <span
              :class="[
                'inline-block mt-1 text-lg font-bold',
                data.confidence === 'A' ? 'text-emerald-600' :
                data.confidence === 'B' ? 'text-amber-600' : 'text-slate-500',
              ]"
            >{{ data.confidence }}</span>
          </div>
        </div>

        <div>
          <h5 class="text-sm font-bold text-slate-700 mb-1">📊 基于舆情的补货理由</h5>
          <p class="text-sm text-slate-700 leading-relaxed bg-blue-50 border border-blue-100 p-3 rounded-lg">
            {{ data.reason || '（AI 正在生成中...）' }}
          </p>
        </div>

        <div v-if="data.items?.length">
          <h5 class="text-sm font-bold text-slate-700 mb-2">📋 涉及 SKU</h5>
          <div class="border border-slate-200 rounded-lg overflow-hidden">
            <table class="w-full text-sm text-left">
              <thead class="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th class="px-3 py-2">商品</th>
                  <th class="px-3 py-2 text-right">当前库存</th>
                  <th class="px-3 py-2 text-right">毛利率</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="sku in data.items" :key="sku.sku_id" class="hover:bg-slate-50">
                  <td class="px-3 py-2 font-medium text-slate-800">
                    {{ sku.name }}
                    <span class="block text-[10px] text-slate-400 font-normal">{{ sku.sku_id }}</span>
                  </td>
                  <td class="px-3 py-2 text-right font-bold text-slate-700">{{ sku.stock }} 盒</td>
                  <td class="px-3 py-2 text-right text-emerald-600 font-medium">{{ sku.margin }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="alertSources.length">
          <h5 class="text-sm font-bold text-slate-700 mb-2">🔔 关联公告 ({{ alertSources.length }} 条)</h5>
          <ul class="space-y-2">
            <li
              v-for="(a, idx) in alertSources"
              :key="idx"
              class="flex items-start gap-2 text-sm text-slate-700 bg-red-50 border border-red-100 rounded-lg p-2.5"
            >
              <span class="text-red-500 flex-shrink-0">📢</span>
              <div class="min-w-0 flex-1">
                <a
                  v-if="a.url && a.url !== '#'"
                  :href="a.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="font-medium text-slate-800 hover:text-red-600 hover:underline"
                >{{ a.label || a.title }}</a>
                <span v-else class="font-medium text-slate-800">{{ a.label || a.title }}</span>
                <p v-if="a.agency" class="text-[10px] text-slate-500 mt-0.5">{{ a.agency }} · {{ a.risk_level }}</p>
              </div>
            </li>
          </ul>
        </div>

        <button
          @click="emit('close')"
          class="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
        >
          关闭
        </button>
      </div>
    </div>
  </div>
</template>
