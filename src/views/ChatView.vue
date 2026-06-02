<script setup>
import { ref } from 'vue'
import AIChatPanel from '@/components/AIChatPanel.vue'
import { useStoreScope } from '@/composables/useStoreScope'
import { currentRole } from '@/composables/useAuth'

const { scopeName } = useStoreScope()

const scenarios = [
  { key: 'cold', label: '感冒咳嗽', emoji: '🤧', message: '感冒咳嗽吃什么药好？' },
  { key: 'chronic', label: '慢病用药', emoji: '💊', message: '高血压患者冬季用药注意事项' },
  { key: 'pregnant', label: '老人孕妇', emoji: '🤰', message: '孕妇感冒发烧能吃什么药？' },
  { key: 'kids', label: '儿童用药', emoji: '👶', message: '儿童退烧药推荐' },
  { key: 'allergy', label: '过敏鼻炎', emoji: '🌸', message: '换季过敏性鼻炎怎么用药？' },
  { key: 'stomach', label: '肠胃不适', emoji: '🫃', message: '胃药饭前吃还是饭后吃？' },
]

const refToPanel = ref(null)
function sendScenario(message) {
  if (refToPanel.value) {
    refToPanel.value.input = message
    refToPanel.value.send()
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-12">
    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span class="w-2 h-7 bg-emerald-500 rounded-full"></span>
          AI 客户咨询
          <span v-if="currentRole === '门店药师'" class="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold ml-2">主菜单</span>
        </h1>
        <p class="text-xs text-slate-500 mt-1">MediPoint RAG · 福建知识库 · {{ scopeName }} 上下文</p>
      </div>

      <section class="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <h2 class="text-sm font-bold text-slate-800 mb-3">🚀 快速场景</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <button
            v-for="s in scenarios"
            :key="s.key"
            @click="sendScenario(s.message)"
            class="flex flex-col items-center gap-1 p-3 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-lg transition"
          >
            <span class="text-2xl">{{ s.emoji }}</span>
            <span class="text-xs font-medium text-slate-700">{{ s.label }}</span>
          </button>
        </div>
      </section>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <AIChatPanel
            ref="refToPanel"
            size="full"
            title="药师 AI 助手 (全屏)"
            subtitle="MediPoint RAG · 福建知识库"
          />
        </div>
        <aside class="space-y-4">
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 class="text-sm font-bold text-slate-800 mb-2">💡 使用提示</h3>
            <ul class="text-xs text-slate-600 space-y-1.5 leading-relaxed">
              <li>• 直接描述症状或药品名，AI 自动匹配知识库</li>
              <li>• 点击「快速场景」一键发起典型问题</li>
              <li>• 回答附带「📎 来源」可溯源到指南 / 法规</li>
              <li>• 涉及处方 / 急症建议就近就医</li>
            </ul>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 class="text-sm font-bold text-slate-800 mb-2">📚 知识库范围</h3>
            <ul class="text-xs text-slate-600 space-y-1 leading-relaxed">
              <li>• 国家中医药管理局指南</li>
              <li>• WHO / 国家基本药物清单</li>
              <li>• 中国高血压 / 糖尿病防治指南</li>
              <li>• NMPA 召回 / 不良反应通报</li>
              <li>• 福建 CDC 流感周报</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  </div>
</template>
