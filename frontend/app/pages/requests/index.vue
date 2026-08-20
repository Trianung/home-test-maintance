<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">{{ role === 'operator' ? 'My Requests' : 'All Requests' }}</h1>
      <NuxtLink to="/requests/create" class="btn btn-primary"><Icon name="lucide:plus-circle" size="1.1em" /> New Request</NuxtLink>
    </div>

    <RequestFilter
      :status="filterStatus"
      :priority="filterPriority"
      @update:status="onStatusChange"
      @update:priority="onPriorityChange"
    />

    <div class="card">
      <div v-if="loading" class="loading-state">Loading requests...</div>

      <div v-else-if="error" class="error-state">Failed to load maintenance requests.</div>

      <div v-else-if="requests.length === 0" class="empty-state">No maintenance requests found.</div>

      <RequestTable v-else :requests="requests" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MaintenanceRequest } from '~/types/request'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const { role } = useAuth()
const { fetchRequests } = useRequests()

const requests = ref<MaintenanceRequest[]>([])
const loading = ref(true)
const error = ref(false)

const filterStatus = ref((route.query.status as string) || '')
const filterPriority = ref((route.query.priority as string) || '')

async function loadData() {
  loading.value = true
  error.value = false
  try {
    requests.value = await fetchRequests({
      status: filterStatus.value,
      priority: filterPriority.value,
    })
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

function onStatusChange(val: string) {
  filterStatus.value = val
  updateQueryAndReload()
}

function onPriorityChange(val: string) {
  filterPriority.value = val
  updateQueryAndReload()
}

function updateQueryAndReload() {
  const query: Record<string, string> = {}
  if (filterStatus.value) query.status = filterStatus.value
  if (filterPriority.value) query.priority = filterPriority.value
  router.replace({ query })
  loadData()
}

onMounted(() => {
  loadData()
})
</script>
