<template>
  <span class="badge" :class="badgeClass">{{ priority }}</span>
</template>

<script setup lang="ts">
import type { Priority } from '~/types/request'

const props = defineProps<{ priority: Priority }>()

const badgeClass = computed(() => {
  const map: Record<Priority, string> = {
    LOW: 'badge-low',
    MEDIUM: 'badge-medium',
    HIGH: 'badge-high',
    CRITICAL: 'badge-critical',
  }
  return map[props.priority] || ''
})
</script>
