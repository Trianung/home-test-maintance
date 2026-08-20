<template>
  <div>
    <div v-if="loading" class="loading-state">Loading request...</div>

    <div v-else-if="error" class="error-state">{{ errorMsg }}</div>

    <template v-else-if="request">
      <div class="page-header">
        <h1 class="page-title">Request #{{ request.id }}</h1>
        <div style="display: flex; gap: var(--spacing-sm)">
          <!-- Edit: operator own+SUBMITTED, supervisor own+SUBMITTED, admin always -->
          <NuxtLink
            v-if="canEdit"
            :to="`/requests/${request.id}/edit`"
            class="btn btn-secondary btn-sm"
          >
            <Icon name="lucide:pencil" size="1em" /> Edit
          </NuxtLink>

          <!-- Approve: supervisor + admin only -->
          <button
            v-if="canReview"
            class="btn btn-success btn-sm"
            @click="showApprove = true"
          >
            <Icon name="lucide:check-circle" size="1em" /> Approve
          </button>

          <!-- Reject: supervisor + admin only -->
          <button
            v-if="canReview"
            class="btn btn-warning btn-sm"
            @click="showReject = true"
          >
            <Icon name="lucide:x-circle" size="1em" /> Reject
          </button>

          <!-- Delete: admin only -->
          <button
            v-if="role === 'admin'"
            class="btn btn-danger btn-sm"
            @click="showDelete = true"
          >
            <Icon name="lucide:trash-2" size="1em" /> Delete
          </button>
        </div>
      </div>

      <div v-if="successMsg" class="alert alert-success">{{ successMsg }}</div>

      <div class="card">
        <div class="detail-list">
          <div class="detail-item">
            <span class="detail-label">Machine / Asset ID</span>
            <span class="detail-value">{{ request.machineAssetId }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Priority</span>
            <span class="detail-value"><PriorityBadge :priority="request.priority" /></span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Status</span>
            <span class="detail-value"><RequestStatusBadge :status="request.status" /></span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Created By</span>
            <span class="detail-value">User #{{ request.createdBy }}</span>
          </div>
          <div class="detail-item full-width">
            <span class="detail-label">Problem Description</span>
            <span class="detail-value">{{ request.problemDescription }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Created At</span>
            <span class="detail-value">{{ formatDate(request.createdAt) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Updated At</span>
            <span class="detail-value">{{ formatDate(request.updatedAt) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Last Reviewed By</span>
            <span class="detail-value">{{ request.lastReviewedBy ? `User #${request.lastReviewedBy}` : '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Last Reviewed At</span>
            <span class="detail-value">{{ request.lastReviewedAt ? formatDate(request.lastReviewedAt) : '-' }}</span>
          </div>
        </div>
      </div>

      <!-- Approve Dialog -->
      <ConfirmDialog
        :visible="showApprove"
        title="Approve Request"
        message="Are you sure you want to approve this maintenance request?"
        confirm-text="Approve"
        confirm-class="btn-success"
        :loading="actionLoading"
        @confirm="handleApprove"
        @cancel="showApprove = false"
      />

      <!-- Reject Dialog -->
      <ConfirmDialog
        :visible="showReject"
        title="Reject Request"
        message="Are you sure you want to reject this maintenance request?"
        confirm-text="Reject"
        confirm-class="btn-warning"
        :loading="actionLoading"
        @confirm="handleReject"
        @cancel="showReject = false"
      />

      <!-- Delete Dialog -->
      <ConfirmDialog
        :visible="showDelete"
        title="Delete Request"
        message="Are you sure you want to delete this maintenance request? This action cannot be undone."
        confirm-text="Delete"
        confirm-class="btn-danger"
        :loading="actionLoading"
        @confirm="handleDelete"
        @cancel="showDelete = false"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { MaintenanceRequest } from '~/types/request'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const { user, role } = useAuth()
const { fetchRequest, approveRequest, rejectRequest, deleteRequest } = useRequests()

const id = Number(route.params.id)
const request = ref<MaintenanceRequest | null>(null)
const loading = ref(true)
const error = ref(false)
const errorMsg = ref('Request not found.')
const successMsg = ref('')

const showApprove = ref(false)
const showReject = ref(false)
const showDelete = ref(false)
const actionLoading = ref(false)

const canEdit = computed(() => {
  if (!request.value || !user.value) return false
  if (role.value === 'admin') return true
  if (request.value.status !== 'SUBMITTED') return false
  return request.value.createdBy === user.value.id
})

const canReview = computed(() => {
  if (!request.value) return false
  return role.value === 'supervisor' || role.value === 'admin'
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

async function loadRequest() {
  loading.value = true
  error.value = false
  try {
    request.value = await fetchRequest(id)
  } catch (err: any) {
    error.value = true
    if (err?.statusCode === 403) errorMsg.value = 'Forbidden: you do not have access to this request.'
    else if (err?.statusCode === 404) errorMsg.value = 'Maintenance request not found.'
    else errorMsg.value = 'Failed to load request.'
  } finally {
    loading.value = false
  }
}

async function handleApprove() {
  actionLoading.value = true
  try {
    const res = await approveRequest(id)
    request.value = res.data
    successMsg.value = 'Request approved successfully.'
    showApprove.value = false
  } catch {
    successMsg.value = ''
  } finally {
    actionLoading.value = false
  }
}

async function handleReject() {
  actionLoading.value = true
  try {
    const res = await rejectRequest(id)
    request.value = res.data
    successMsg.value = 'Request rejected successfully.'
    showReject.value = false
  } catch {
    successMsg.value = ''
  } finally {
    actionLoading.value = false
  }
}

async function handleDelete() {
  actionLoading.value = true
  try {
    await deleteRequest(id)
    await navigateTo('/requests')
  } catch {
    actionLoading.value = false
  }
}

onMounted(() => {
  loadRequest()
})
</script>
