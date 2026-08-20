<template>
  <span class="badge" :class="badgeClass">{{ status }}</span>
</template>

<script setup lang="ts">
import type { RequestStatus } from '~/types/request'

const props = defineProps<{ status: RequestStatus }>()

const badgeClass = computed(() => {
  const map: Record<RequestStatus, string> = {
    SUBMITTED: 'badge-submitted',
    APPROVED: 'badge-approved',
    REJECTED: 'badge-rejected',
  }
  return map[props.status] || ''
})
</script>
