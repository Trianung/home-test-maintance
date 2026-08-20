<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Create Request</h1>
    </div>

    <div v-if="errorMsg" class="alert alert-error">{{ errorMsg }}</div>

    <div class="card">
      <RequestForm
        v-model:machineAssetId="machineAssetId"
        v-model:problemDescription="problemDescription"
        v-model:priority="priority"
        submit-label="Create Request"
        :loading="loading"
        :errors="fieldErrors"
        @submit="handleCreate"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { createRequest } = useRequests()

const machineAssetId = ref('')
const problemDescription = ref('')
const priority = ref('')
const loading = ref(false)
const errorMsg = ref('')
const fieldErrors = ref<Record<string, string[]>>({})

async function handleCreate() {
  loading.value = true
  errorMsg.value = ''
  fieldErrors.value = {}

  try {
    await createRequest({
      machineAssetId: machineAssetId.value,
      problemDescription: problemDescription.value,
      priority: priority.value,
    })
    await navigateTo('/requests')
  } catch (err: any) {
    if (err?.data?.errors) {
      fieldErrors.value = err.data.errors
    }
    errorMsg.value = err?.data?.message || 'Failed to create request.'
  } finally {
    loading.value = false
  }
}
</script>
