<script setup>
defineProps({
  alerts: { type: Array, default: () => [] },
})
</script>

<template>
  <div v-if="alerts.length" class="bg-orange-50 border-b border-orange-100 overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 py-2">
      <div class="flex gap-6 animate-marquee whitespace-nowrap">
        <div v-for="(a, idx) in alerts" :key="idx" class="flex items-center gap-2 text-sm text-orange-800">
          <span class="bg-orange-200 text-orange-900 text-[10px] font-bold px-2 py-0.5 rounded">
            {{ a.agency }}
          </span>
          <span class="font-medium">{{ a.title }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-marquee { animation: marquee 30s linear infinite; }
@keyframes marquee {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}
</style>
