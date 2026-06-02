<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ACCOUNTS, storesByIds } from '@/data/mockAccounts'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const { login } = useAuth()

function storeNames(ids) {
  return storesByIds(ids).map(s => s.name).join(' · ')
}

function pick(email) {
  if (!login(email)) return
  const target = route.query.redirect || { name: 'dashboard' }
  router.push(target)
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 flex items-center justify-center p-4">
    <div class="w-full max-w-3xl">
      <div class="text-center mb-8">
        <div class="inline-flex items-center gap-3 mb-3">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-black text-lg shadow-lg">M</div>
          <h1 class="text-3xl font-black text-slate-900">药点 MediPoint</h1>
        </div>
        <p class="text-sm text-slate-500">ERP 智慧商情 · 福建 — 选择演示账号登录</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <button
          v-for="acc in ACCOUNTS"
          :key="acc.email"
          @click="pick(acc.email)"
          class="bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-lg rounded-xl p-4 text-left transition-all group"
        >
          <div class="flex items-start gap-3">
            <div class="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
              {{ acc.avatar }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <span class="font-bold text-slate-900">{{ acc.name }}</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">
                  {{ acc.role_label }}
                </span>
              </div>
              <p class="text-[10px] text-slate-400 mb-2 truncate">{{ acc.email }}</p>
              <p class="text-[11px] text-slate-600 leading-snug">
                <span class="text-slate-400">可见：</span>{{ storeNames(acc.store_ids) }}
              </p>
            </div>
          </div>
        </button>
      </div>

      <p class="text-center text-[10px] text-slate-400 mt-6">
        演示用 — 任意账号均可登录，无密码 · 数据为前端内嵌 mock
      </p>
    </div>
  </div>
</template>
