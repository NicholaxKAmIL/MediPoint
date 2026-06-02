<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { currentAccount, currentRole, currentVisibleStoreIds } from '@/composables/useAuth'
import { useStoreScope } from '@/composables/useStoreScope'
import { STORES } from '@/data/mockDashboard'
import ScriptModal from '@/components/ScriptModal.vue'
import ConfidenceBadge from '@/components/ConfidenceBadge.vue'

const { scopeName } = useStoreScope()

const isHQ = computed(() => currentRole.value === 'HQ Manager')
const isPharmacist = computed(() => currentRole.value === '门店药师')

const initialTemplates = [
  {
    id: 'T-001', title: '流感高峰 — 退烧话术', category: '感冒用药 / 退烧',
    scenario: '顾客主诉发热 / 头痛 / 肌肉酸痛 1-2 天',
    confidence: 'A',
    content: '近期流感活动明显上升，您有低热肌肉酸痛症状，可先用对乙酰氨基酚退热，再加连花清瘟 1 天 3 次，4 天一个疗程；如出现 39℃ 以上高热或呼吸困难请立即就医。',
    target_stores: ['S001', 'S002', 'S003'],
    published_at: '2025-12-15', publisher: '总部药事委员会',
  },
  {
    id: 'T-002', title: '换季过敏 — 鼻喷话术', category: '过敏 / 鼻喷',
    scenario: '顾客主诉换季鼻痒 / 连续打喷嚏 / 眼痒',
    confidence: 'A',
    content: '换季过敏性鼻炎可以先尝试氯雷他定 1 片/日，喷鼻可联合糠酸莫米松每日 1 次；2 周未改善建议到耳鼻喉科评估。',
    target_stores: ['S001', 'S002', 'S003'],
    published_at: '2025-12-12', publisher: '总部药事委员会',
  },
  {
    id: 'T-003', title: '孕妇感冒安全用药', category: '感冒用药 / 退烧',
    scenario: '孕妇咨询感冒 / 退烧用药',
    confidence: 'A',
    content: '孕期退烧首选对乙酰氨基酚 (必理通)，布洛芬在孕晚期 (28 周后) 禁用；中成药请在执业药师指导下使用。',
    target_stores: ['S001', 'S002', 'S003'],
    published_at: '2025-12-10', publisher: '总部药事委员会',
  },
  {
    id: 'T-004', title: 'NMPA 召回应对 — 铝碳酸镁片', category: '胃药',
    scenario: '顾客咨询某品牌铝碳酸镁片',
    confidence: 'A',
    content: 'NMPA 已对该批次铝碳酸镁片启动三级召回，请顾客核对包装批号 (详见告示)；如属召回批次请立即下架退款。',
    target_stores: ['S001', 'S002', 'S003'],
    published_at: '2025-12-15', publisher: '总部合规组',
  },
  {
    id: 'T-005', title: '湿热肠胃 — 藿香正气话术', category: '中成药 / 肠胃',
    scenario: '顾客主诉暑湿 + 肠胃不适',
    confidence: 'B',
    content: '南方湿热季节肠胃不适多为暑湿感冒，可推荐藿香正气水或胶囊；驾驶员请选用不含醇的胶囊剂型。',
    target_stores: ['S003'],
    published_at: '2025-12-08', publisher: '总部药事委员会',
  },
]

const templates = ref([...initialTemplates])
const filterCategory = ref('全部')
const previewTemplate = ref(null)
const toast = ref('')
let toastTimer = null

const editing = ref({
  id: '', title: '', category: '', scenario: '', content: '', confidence: 'B', target_stores: [],
})

const categories = computed(() => ['全部', ...new Set(templates.value.map(t => t.category))])

const visibleTemplates = computed(() => {
  let arr = templates.value
  if (!isHQ.value) {
    const sid = currentVisibleStoreIds.value[0]
    const allStoreIds = STORES.map(s => s.store_id)
    // 全店下发 (target_stores 覆盖全部 3 家) 或显式包含本店
    arr = arr.filter(t => {
      const targets = t.target_stores || []
      const isBroadcast = allStoreIds.every(id => targets.includes(id))
      return isBroadcast || targets.includes(sid)
    })
  }
  if (filterCategory.value !== '全部') {
    arr = arr.filter(t => t.category === filterCategory.value)
  }
  return arr
})

function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ''), 2500)
}

function startEdit(t = null) {
  if (t) {
    editing.value = { ...t }
  } else {
    editing.value = {
      id: `T-${Date.now()}`, title: '', category: '', scenario: '', content: '',
      confidence: 'B', target_stores: [...STORES.map(s => s.store_id)],
    }
  }
}

function saveTemplate() {
  if (!editing.value.title || !editing.value.content) {
    showToast('请填写标题和内容')
    return
  }
  const idx = templates.value.findIndex(t => t.id === editing.value.id)
  const newTpl = {
    ...editing.value,
    published_at: new Date().toISOString().slice(0, 10),
    publisher: currentAccount.value?.name + ' (总部)',
  }
  if (idx >= 0) templates.value[idx] = newTpl
  else templates.value.unshift(newTpl)
  showToast('模板已保存')
  editing.value = { id: '', title: '', category: '', scenario: '', content: '', confidence: 'B', target_stores: [] }
}

function deleteTemplate(id) {
  templates.value = templates.value.filter(t => t.id !== id)
  showToast('已删除')
}

function distribute(t) {
  showToast(`已下发到 ${t.target_stores.length} 家门店`)
}

function toggleStore(storeId) {
  if (editing.value.target_stores.includes(storeId)) {
    editing.value.target_stores = editing.value.target_stores.filter(s => s !== storeId)
  } else {
    editing.value.target_stores = [...editing.value.target_stores, storeId]
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span class="w-2 h-7 bg-emerald-500 rounded-full"></span>
          策略下发 · 话术模板
        </h1>
        <p class="text-xs text-slate-500 mt-1">
          <span v-if="isHQ">总部编辑官方话术 · 勾选门店后一键下发</span>
          <span v-else-if="isPharmacist">查看总部下发的官方话术 · 选用后可在客户咨询时直接调用</span>
          <span v-else>{{ scopeName }}</span>
        </p>
      </div>

      <section v-if="isHQ" class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
          <span class="w-1.5 h-5 bg-emerald-500 rounded"></span>
          {{ editing.id ? '编辑话术模板' : '新建话术模板' }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="text-xs font-bold text-slate-600 mb-1 block">标题</label>
            <input v-model="editing.title" type="text" placeholder="如：流感高峰 — 退烧话术"
              class="w-full text-sm border border-slate-200 rounded-md px-3 py-2 focus:outline-none focus:border-emerald-400" />
          </div>
          <div>
            <label class="text-xs font-bold text-slate-600 mb-1 block">关联品类</label>
            <input v-model="editing.category" type="text" placeholder="如：感冒用药 / 退烧"
              class="w-full text-sm border border-slate-200 rounded-md px-3 py-2 focus:outline-none focus:border-emerald-400" />
          </div>
          <div>
            <label class="text-xs font-bold text-slate-600 mb-1 block">适用场景</label>
            <input v-model="editing.scenario" type="text" placeholder="如：顾客主诉发热 / 头痛"
              class="w-full text-sm border border-slate-200 rounded-md px-3 py-2 focus:outline-none focus:border-emerald-400" />
          </div>
          <div>
            <label class="text-xs font-bold text-slate-600 mb-1 block">信心级别</label>
            <select v-model="editing.confidence" class="w-full text-sm border border-slate-200 rounded-md px-3 py-2 focus:outline-none focus:border-emerald-400">
              <option value="A">A — 高信心</option>
              <option value="B">B — 中信心</option>
              <option value="C">C — 参考</option>
            </select>
          </div>
          <div class="md:col-span-2">
            <label class="text-xs font-bold text-slate-600 mb-1 block">话术正文</label>
            <textarea v-model="editing.content" rows="4" placeholder="店员可直接对客户说的标准话术..."
              class="w-full text-sm border border-slate-200 rounded-md px-3 py-2 focus:outline-none focus:border-emerald-400"></textarea>
          </div>
          <div class="md:col-span-2">
            <label class="text-xs font-bold text-slate-600 mb-1 block">下发到门店</label>
            <div class="flex flex-wrap gap-2">
              <label v-for="s in STORES" :key="s.store_id" class="flex items-center gap-1 text-xs bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded cursor-pointer">
                <input type="checkbox" :checked="editing.target_stores.includes(s.store_id)" @change="toggleStore(s.store_id)" class="accent-emerald-600" />
                {{ s.name }}
              </label>
            </div>
          </div>
        </div>
        <div class="flex gap-2">
          <button @click="saveTemplate" class="text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-bold">
            {{ editing.id ? '保存修改' : '创建模板' }}
          </button>
          <button v-if="editing.id" @click="editing = { id: '', title: '', category: '', scenario: '', content: '', confidence: 'B', target_stores: [] }" class="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-md font-bold">
            取消编辑
          </button>
        </div>
      </section>

      <div class="flex items-center gap-2 flex-wrap text-xs">
        <span class="font-bold text-slate-600">分类筛选：</span>
        <button
          v-for="c in categories"
          :key="c"
          @click="filterCategory = c"
          :class="`px-3 py-1.5 rounded-full text-xs font-bold transition border ${
            filterCategory === c
              ? 'bg-slate-800 text-white border-slate-800'
              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
          }`"
        >
          {{ c }}
        </button>
      </div>

      <section class="space-y-3">
        <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
          <span class="w-1.5 h-5 bg-blue-500 rounded"></span>
          模板列表 ({{ visibleTemplates.length }})
        </h2>
        <div v-if="!visibleTemplates.length" class="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400 text-sm">
          当前筛选下暂无模板
        </div>
        <div
          v-for="t in visibleTemplates"
          :key="t.id"
          class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition"
        >
          <div class="flex items-start gap-3 flex-wrap">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <span class="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded">{{ t.category }}</span>
                <ConfidenceBadge :level="t.confidence" />
                <span class="text-[10px] text-slate-400">{{ t.published_at }} · {{ t.publisher }}</span>
              </div>
              <h3 class="text-sm font-bold text-slate-800">{{ t.title }}</h3>
              <p class="text-xs text-slate-500 mt-1"><span class="font-bold text-slate-600">场景：</span>{{ t.scenario }}</p>
              <p class="text-xs text-slate-700 mt-2 line-clamp-3 leading-relaxed bg-slate-50 p-2 rounded border border-slate-100">
                {{ t.content }}
              </p>
              <div class="mt-2 flex flex-wrap gap-1">
                <span v-for="sid in t.target_stores" :key="sid" class="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                  📍 {{ STORES.find(s => s.store_id === sid)?.name || sid }}
                </span>
              </div>
            </div>
            <div class="flex flex-col gap-1.5 flex-shrink-0">
              <button @click="previewTemplate = t" class="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded font-bold">
                查看完整
              </button>
              <button v-if="isPharmacist" @click="previewTemplate = t" class="text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded font-bold">
                选用
              </button>
              <template v-if="isHQ">
                <button @click="distribute(t)" class="text-[11px] bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded font-bold">
                  一键下发
                </button>
                <button @click="startEdit(t)" class="text-[11px] bg-amber-100 hover:bg-amber-200 text-amber-700 px-2.5 py-1 rounded font-bold">
                  编辑
                </button>
                <button @click="deleteTemplate(t.id)" class="text-[11px] bg-red-100 hover:bg-red-200 text-red-700 px-2.5 py-1 rounded font-bold">
                  删除
                </button>
              </template>
            </div>
          </div>
        </div>
      </section>
    </main>

    <ScriptModal
      v-if="previewTemplate"
      :show="true"
      :data="{
        title: previewTemplate.title,
        category: previewTemplate.category,
        intro: previewTemplate.content,
      }"
      @close="previewTemplate = null"
    />

    <div v-if="toast" class="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-2.5 rounded-lg shadow-lg text-sm z-50">
      {{ toast }}
    </div>
  </div>
</template>
