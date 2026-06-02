<script setup>
import { computed } from 'vue'
import { currentRole } from '@/composables/useAuth'
import HQDashboard from './HQDashboard.vue'
import RegionDashboard from './RegionDashboard.vue'
import StoreDashboard from './StoreDashboard.vue'

const component = computed(() => {
  const r = currentRole.value
  if (r === 'HQ Manager') return HQDashboard
  if (r === '区域督导') return RegionDashboard
  if (r === '门店药师') return StoreDashboard
  return HQDashboard
})
</script>

<template>
  <component :is="component" />
</template>
