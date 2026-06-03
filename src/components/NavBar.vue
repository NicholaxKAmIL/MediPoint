<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useRoleNav } from '@/composables/useRoleNav'
import { ROLE_LABELS } from '@/data/mockAccounts'

const route = useRoute()
const router = useRouter()
const { currentAccount, currentRole, logout } = useAuth()
const { navItems } = useRoleNav()

const initial = (name) => (name || '?').slice(0, 1)

function doLogout() {
  logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <header class="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16 gap-4">
        <div class="flex items-center gap-6 min-w-0">
          <div class="flex items-center gap-3 flex-shrink-0">
            <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-black text-sm">M</div>
            <div class="hidden sm:block">
              <h1 class="text-base font-bold text-slate-900 leading-tight">闽药智典 MediPoint</h1>
              <p class="text-[10px] text-slate-500 leading-none">ERP 智慧商情 · 福建</p>
            </div>
          </div>

          <nav class="hidden md:flex items-center gap-1 overflow-x-auto scrollbar-hide">
            <router-link
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              :class="`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition ${
                route.path === item.path
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`"
            >
              {{ item.name }}
            </router-link>
          </nav>
        </div>

        <div class="flex items-center gap-2 flex-shrink-0">
          <div v-if="currentAccount" class="hidden sm:flex items-center gap-2 bg-slate-50 rounded-md px-2 py-1 border border-slate-200">
            <div class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
              {{ initial(currentAccount.name) }}
            </div>
            <span class="text-xs font-bold text-slate-700">{{ currentAccount.name }}</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">
              {{ ROLE_LABELS[currentRole] || currentRole }}
            </span>
          </div>

          <button
            @click="doLogout"
            class="text-xs text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 px-2.5 py-1.5 rounded-md font-medium transition"
          >
            登出
          </button>
        </div>
      </div>

      <nav class="md:hidden flex items-center gap-1 pb-2 overflow-x-auto scrollbar-hide">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :class="`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
            route.path === item.path ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600'
          }`"
        >
          {{ item.name }}
        </router-link>
      </nav>
    </div>
  </header>
</template>
