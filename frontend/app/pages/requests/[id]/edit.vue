<template>
  <div>
    <div v-if="pageLoading" class="loading-state">Loading request...</div>

    <div v-else-if="pageError" class="error-state">{{ pageErrorMsg }}</div>

    <template v-else>
      <div class="page-header">
        <h1 class="page-title">Edit Request #{{ id }}</h1>
      </div>

      <div v-if="errorMsg" class="alert alert-error">{{ errorMsg }}</div>

      <div class="card">
        <RequestForm
          v-model:machineAssetId="machineAssetId"
          v-model:problemDescription="problemDescription"
          v-model:priority="priority"
          submit-label="Update Request"
          :loading="loading"
          :errors="fieldErrors"
          @submit="handleUpdate"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const { user, role } = useAuth()
const { fetchRequest, updateRequest } = useRequests()

const id = Number(route.params.id)

const machineAssetId = ref('')
const problemDescription = ref('')
const priority = ref('')
const loading = ref(false)
const errorMsg = ref('')
const fieldErrors = ref<Record<string, string[]>>({})

const pageLoading = ref(true)
const pageError = ref(false)
const pageErrorMsg = ref('')

onMounted(async () => {
  try {
    const req = await fetchRequest(id)

    // Check edit permission on frontend (backend still validates)
    if (role.value === 'operator' || role.value === 'supervisor') {
      if (req.createdBy !== user.value?.id || req.status !== 'SUBMITTED') {
        pageError.value = true
        pageErrorMsg.value = 'You do not have permission to edit this request.'
        return
      }
    }

    machineAssetId.value = req.machineAssetId
    problemDescription.value = req.problemDescription
    priority.value = req.priority
  } catch (err: any) {
    pageError.value = true
    pageErrorMsg.value = err?.data?.message || 'Failed to load request.'
  } finally {
    pageLoading.value = false
  }
})

async function handleUpdate() {
  loading.value = true
  errorMsg.value = ''
  fieldErrors.value = {}

  try {
    await updateRequest(id, {
      machineAssetId: machineAssetId.value,
      problemDescription: problemDescription.value,
      priority: priority.value,
    })
    await navigateTo(`/requests/${id}`)
  } catch (err: any) {
    if (err?.data?.errors) {
      fieldErrors.value = err.data.errors
    }
    errorMsg.value = err?.data?.message || 'Failed to update request.'
  } finally {
    loading.value = false
  }
}
</script>
