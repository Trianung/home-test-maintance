<template>
  <div class="table-container">
    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Machine / Asset</th>
          <th>Problem</th>
          <th>Priority</th>
          <th>Status</th>
          <th>Created At</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="req in requests" :key="req.id">
          <td>{{ req.id }}</td>
          <td>{{ req.machineAssetId }}</td>
          <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis;">{{ req.problemDescription }}</td>
          <td><PriorityBadge :priority="req.priority" /></td>
          <td><RequestStatusBadge :status="req.status" /></td>
          <td>{{ formatDate(req.createdAt) }}</td>
          <td>
            <NuxtLink :to="`/requests/${req.id}`" class="btn btn-secondary btn-sm">View</NuxtLink>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { MaintenanceRequest } from '~/types/request'

defineProps<{
  requests: MaintenanceRequest[]
}>()

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
