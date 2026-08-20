<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Dashboard</h1>
    </div>

    <p style="margin-bottom: var(--spacing-lg); color: var(--color-text-secondary)">
      Welcome back, <strong>{{ user?.name }}</strong> — {{ user?.role }}
    </p>

    <div v-if="loading" class="loading-state">Loading dashboard...</div>

    <template v-else-if="error">
      <div class="error-state">Failed to load requests.</div>
    </template>

    <template v-else>
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-label">Total Requests</div>
          <div class="stat-value">{{ requests.length }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Submitted</div>
          <div class="stat-value">{{ countByStatus('SUBMITTED') }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Approved</div>
          <div class="stat-value">{{ countByStatus('APPROVED') }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Rejected</div>
          <div class="stat-value">{{ countByStatus('REJECTED') }}</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Quick Actions</h2>
        </div>
        <div style="display: flex; gap: var(--spacing-sm); flex-wrap: wrap">
          <NuxtLink to="/requests/create" class="btn btn-primary">➕ New Request</NuxtLink>
          <NuxtLink to="/requests" class="btn btn-secondary">📋 {{ role === 'operator' ? 'My Requests' : 'All Requests' }}</NuxtLink>
          <template v-if="role === 'supervisor' || role === 'admin'">
            <NuxtLink to="/requests?status=SUBMITTED" class="btn btn-warning">⏳ Pending Review</NuxtLink>
          </template>
          <template v-if="role === 'admin'">
            <NuxtLink to="/users" class="btn btn-secondary">👥 Manage Users</NuxtLink>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { MaintenanceRequest, RequestStatus } from '~/types/request'

definePageMeta({ middleware: 'auth' })

const { user, role } = useAuth()
const { apiFetch } = useApi()

const requests = ref<MaintenanceRequest[]>([])
const loading = ref(true)
const error = ref(false)

function countByStatus(status: RequestStatus) {
  return requests.value.filter((r) => r.status === status).length
}

onMounted(async () => {
  try {
    requests.value = await apiFetch<MaintenanceRequest[]>('/requests')
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>
