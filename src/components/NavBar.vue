<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const role = ref('HQ Manager')

const navItems = [
  { name: '战情总览', path: '/' },
  { name: '全网舆情', path: '/sentiment' },
  { name: 'AI 采购决策', path: '/decisions' },
  { name: '法规政策', path: '/regulations' },
]
</script>

<template>
  <header class="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16 gap-4">
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-black text-sm">M</div>
            <div class="hidden sm:block">
              <h1 class="text-base font-bold text-slate-900 leading-tight">药点 MediPoint</h1>
              <p class="text-[10px] text-slate-500 leading-none">ERP 智慧商情 · 福建</p>
            </div>
          </div>

          <nav class="hidden md:flex items-center gap-1">
            <router-link
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              :class="`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                route.path === item.path
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`"
            >
              {{ item.name }}
            </router-link>
          </nav>
        </div>

        <div class="flex items-center gap-2">
          <div class="hidden sm:flex items-center gap-2 bg-slate-50 rounded-md px-2 py-1 border border-slate-200">
            <span class="text-[10px] text-slate-500">角色</span>
            <select v-model="role" class="text-xs bg-transparent font-bold text-slate-700 focus:outline-none">
              <option>HQ Manager</option>
              <option>区域督导</option>
              <option>门店药师</option>
            </select>
          </div>

          <div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
            {{ role[0] }}
          </div>
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
