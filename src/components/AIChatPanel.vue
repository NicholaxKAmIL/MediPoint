<script setup>
import { ref, nextTick } from 'vue'
import { sendChat } from '@/data'
import { CHAT_SUGGESTIONS } from '@/data/mockChat'

const props = defineProps({
  size: { type: String, default: 'sm' }, // sm | md | lg | full
  title: { type: String, default: '药师 AI 助手' },
  subtitle: { type: String, default: 'MediPoint RAG · 福建知识库' },
  initialMessage: { type: String, default: '您好，我是 MediPoint 药师 AI 助手。可向我咨询用药、剂量、替代品等问题。' },
})

const messages = ref([
  { role: 'ai', text: props.initialMessage, source: 'MediPoint RAG v2.1' },
])
const input = ref('')
const loading = ref(false)
const messagesEl = ref(null)

async function send() {
  const text = input.value.trim()
  if (!text || loading.value) return
  input.value = ''
  messages.value.push({ role: 'user', text })
  loading.value = true
  await nextTick()
  scrollBottom()

  await new Promise(r => setTimeout(r, 500))

  const reply = await sendChat(text)
  messages.value.push({ role: 'ai', text: reply.answer, source: reply.source, confidence: reply.confidence })
  loading.value = false
  await nextTick()
  scrollBottom()
}

function useSuggestion(s) {
  input.value = s
  send()
}

function scrollBottom() {
  if (messagesEl.value) {
    messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  }
}

const isFull = () => props.size === 'full'
const isLg = () => props.size === 'lg'

defineExpose({ input, send })
</script>

<template>
  <div
    :class="[
      'bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden',
      isFull() ? 'h-[calc(100vh-12rem)]' : isLg() ? 'h-[520px]' : 'h-[420px]',
    ]"
  >
    <div class="bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-3 flex items-center gap-2 flex-shrink-0">
      <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-base">💊</div>
      <div class="text-white">
        <p class="text-sm font-bold leading-none">{{ title }}</p>
        <p class="text-[10px] text-emerald-100 mt-0.5">{{ subtitle }}</p>
      </div>
    </div>

    <div ref="messagesEl" class="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50">
      <div
        v-for="(m, idx) in messages"
        :key="idx"
        :class="`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`"
      >
        <div
          :class="`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
            m.role === 'user'
              ? 'bg-emerald-600 text-white rounded-br-sm'
              : 'bg-white text-slate-800 rounded-bl-sm border border-slate-100'
          }`"
        >
          <p class="leading-relaxed whitespace-pre-wrap">{{ m.text }}</p>
          <p v-if="m.source && m.role === 'ai'" class="text-[10px] mt-1 opacity-70">📎 {{ m.source }}</p>
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

    <div v-if="messages.length <= 2" class="px-3 py-2 border-t border-slate-100 bg-white flex-shrink-0">
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

    <form @submit.prevent="send" class="border-t border-slate-200 p-2 bg-white flex items-center gap-2 flex-shrink-0">
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
</template>
