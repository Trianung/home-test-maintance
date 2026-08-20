<template>
  <div class="filter-bar">
    <select class="form-select" :value="status" @change="$emit('update:status', ($event.target as HTMLSelectElement).value)">
      <option value="">All Status</option>
      <option value="SUBMITTED">Submitted</option>
      <option value="APPROVED">Approved</option>
      <option value="REJECTED">Rejected</option>
    </select>

    <select class="form-select" :value="priority" @change="$emit('update:priority', ($event.target as HTMLSelectElement).value)">
      <option value="">All Priority</option>
      <option value="LOW">Low</option>
      <option value="MEDIUM">Medium</option>
      <option value="HIGH">High</option>
      <option value="CRITICAL">Critical</option>
    </select>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  status: string
  priority: string
}>()

defineEmits(['update:status', 'update:priority'])
</script>
