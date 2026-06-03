<script setup>
import { ref, nextTick, onUnmounted } from 'vue'
import { streamChat } from '@/composables/useStoreData'
import { CHAT_SUGGESTIONS } from '@/data/mockChat'

const open = ref(false)
const messages = ref([
  { role: 'ai', text: '您好，我是 MediPoint 药师 AI 助手。可向我咨询用药、剂量、替代品等问题。', source: 'MediPoint RAG v2.1', references: [] },
])
const input = ref('')
const loading = ref(false)
const messagesEl = ref(null)
let abortController = null

onUnmounted(() => {
  if (abortController) abortController.abort()
})

async function send() {
  const text = input.value.trim()
  if (!text || loading.value) return
  input.value = ''
  messages.value.push({ role: 'user', text })
  loading.value = true
  await nextTick()
  scrollBottom()

  const aiMsg = { role: 'ai', text: '', source: '', references: [] }
  messages.value.push(aiMsg)
  await nextTick()
  scrollBottom()

  abortController = new AbortController()
  const history = messages.value
    .filter(m => m.role === 'user' || m.role === 'ai')
    .slice(0, -1) // 去掉刚 push 的 aiMsg (空)
    .slice(-6)
    .map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }))

  await streamChat(
    text,
    history,
    (delta) => {
      aiMsg.text += delta
      scrollBottom()
    },
    (info) => {
      aiMsg.source = info.source
      if (Array.isArray(info.references)) aiMsg.references = info.references
      loading.value = false
      nextTick(scrollBottom)
    },
    abortController.signal,
    (refs) => {
      aiMsg.references = Array.isArray(refs) ? refs : []
    },
  )
  if (loading.value) {
    loading.value = false
  }
  abortController = null
}

function useSuggestion(s) {
  input.value = s
  send()
}

function scrollBottom() {
  if (_scrollRaf) return
  _scrollRaf = requestAnimationFrame(() => {
    _scrollRaf = null
    if (messagesEl.value) {
      const el = messagesEl.value
      const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
      if (distFromBottom < 120) {
        el.scrollTop = el.scrollHeight
      }
    }
  })
}

function safeHref(u) {
  if (!u) return null
  const s = String(u).trim()
  return /^https?:\/\//i.test(s) ? s : null
}
</script>

<template>
  <div class="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
    <div
      v-if="open"
      class="w-[360px] max-w-[90vw] h-[520px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-pop"
    >
      <div class="bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-2 text-white">
          <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">💊</div>
          <div>
            <p class="text-sm font-bold leading-none">药师 AI 助手</p>
            <p class="text-[10px] text-emerald-100 mt-0.5">MediPoint RAG · 福建知识库</p>
          </div>
        </div>
        <button @click="open = false" class="text-white/80 hover:text-white text-xl leading-none">×</button>
      </div>

      <div ref="messagesEl" class="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50">
        <div
          v-for="(m, idx) in messages"
          :key="idx"
          :class="`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`"
        >
          <div
            :class="`max-w-[85%] rounded-2xl text-sm shadow-sm ${
              m.role === 'user'
                ? 'bg-emerald-600 text-white rounded-br-sm px-3 py-2'
                : 'bg-white text-slate-800 rounded-bl-sm border border-slate-100'
            }`"
          >
            <p v-if="m.text || m.role === 'user'" class="leading-relaxed whitespace-pre-wrap px-3 py-2">{{ m.text }}</p>
            <p v-if="m.source" class="text-[10px] px-3 pb-1 opacity-70">📎 {{ m.source }}</p>
            <details
              v-if="m.role === 'ai' && m.references && m.references.length"
              class="border-t border-slate-100 bg-slate-50/60 text-[11px] text-slate-600"
            >
              <summary class="cursor-pointer select-none px-3 py-1.5 hover:bg-slate-100/80 text-slate-500">
                📚 AI 回答基于 {{ m.references.length }} 条参考资料
              </summary>
              <ul class="px-3 py-2 space-y-1.5">
                <li
                  v-for="r in m.references"
                  :key="r.n"
                  class="flex gap-2 items-start"
                >
                  <span class="font-mono text-emerald-600 font-bold flex-shrink-0">[{{ r.n }}]</span>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-1 flex-wrap">
                      <span class="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px]">
                        {{ r.source_type_label || r.source_type }}
                      </span>
                      <a
                        v-if="safeHref(r.url)"
                        :href="safeHref(r.url)"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="font-medium text-slate-700 hover:text-emerald-600 hover:underline truncate"
                      >
                        {{ r.title || '查看原文' }} ↗
                      </a>
                      <span v-else class="font-medium text-slate-700 truncate">{{ r.title || '查看原文' }}</span>
                      <span v-if="r.agency" class="text-slate-400 text-[10px]">· {{ r.agency }}</span>
                    </div>
                    <p v-if="r.snippet" class="text-slate-500 text-[10px] mt-0.5 line-clamp-2">{{ r.snippet }}</p>
                  </div>
                </li>
              </ul>
            </details>
          </div>
        </div>
        <div v-if="loading" class="flex justify-start">
          <div class="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-3 py-2 text-xs text-slate-500 shadow-sm">
            <span class="inline-flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style="animation-delay: 0ms"></span>
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style="animation-delay: 150ms"></span>
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style="animation-delay: 300ms"></span>
              正在检索法规库...
            </span>
          </div>
        </div>
      </div>

      <div v-if="messages.length <= 2" class="px-3 py-2 border-t border-slate-100 bg-white">
        <p class="text-[10px] text-slate-400 mb-1">💡 常见问题</p>
        <div class="flex flex-wrap gap-1">
          <button
            v-for="s in CHAT_SUGGESTIONS"
            :key="s"
            @click="useSuggestion(s)"
            class="text-[10px] bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 px-2 py-1 rounded-full"
          >
            {{ s }}
          </button>
        </div>
      </div>

      <form @submit.prevent="send" class="border-t border-slate-200 p-2 bg-white flex items-center gap-2">
        <input
          v-model="input"
          type="text"
          placeholder="输入用药问题..."
          class="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-400"
        />
        <button
          type="submit"
          :disabled="loading"
          class="bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 disabled:opacity-50"
        >
          发送
        </button>
      </form>
    </div>

    <button
      @click="open = !open"
      class="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg hover:shadow-xl flex items-center justify-center text-2xl transition-all hover:scale-105"
      aria-label="AI 药师助手"
    >
      <span v-if="!open">💊</span>
      <span v-else>×</span>
    </button>
  </div>
</template>

<style scoped>
.animate-pop { animation: pop 0.2s ease-out; }
@keyframes pop {
  from { opacity: 0; transform: translateY(10px) scale(0.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
