<template>
  <div id="app" class="min-h-screen bg-slate-50">
    <NavBar v-if="isLoggedIn" />
    <router-view />
    <AIChatWidget v-if="isLoggedIn" />
  </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue'
import AIChatWidget from '@/components/AIChatWidget.vue'
import { isLoggedIn } from '@/composables/useAuth'
</script>

<style>
#app {
  width: 100%;
  min-height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif;
}
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
