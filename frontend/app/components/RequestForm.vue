<template>
  <form @submit.prevent="$emit('submit')">
    <div class="form-group">
      <label class="form-label" for="machineAssetId">Machine / Asset ID</label>
      <input
        id="machineAssetId"
        :value="machineAssetId"
        type="text"
        class="form-input"
        placeholder="e.g. MC-001"
        required
        maxlength="100"
        @input="$emit('update:machineAssetId', ($event.target as HTMLInputElement).value)"
      />
      <p v-if="errors?.machineAssetId" class="form-error">{{ errors.machineAssetId[0] }}</p>
    </div>

    <div class="form-group">
      <label class="form-label" for="problemDescription">Problem Description</label>
      <textarea
        id="problemDescription"
        :value="problemDescription"
        class="form-textarea"
        placeholder="Describe the problem..."
        required
        @input="$emit('update:problemDescription', ($event.target as HTMLTextAreaElement).value)"
      />
      <p v-if="errors?.problemDescription" class="form-error">{{ errors.problemDescription[0] }}</p>
    </div>

    <div class="form-group">
      <label class="form-label" for="priority">Priority</label>
      <select
        id="priority"
        :value="priority"
        class="form-select"
        required
        @change="$emit('update:priority', ($event.target as HTMLSelectElement).value)"
      >
        <option value="" disabled>Select priority</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
        <option value="CRITICAL">Critical</option>
      </select>
      <p v-if="errors?.priority" class="form-error">{{ errors.priority[0] }}</p>
    </div>

    <div style="display: flex; gap: var(--spacing-sm); justify-content: flex-end">
      <NuxtLink to="/requests" class="btn btn-secondary">Cancel</NuxtLink>
      <button type="submit" class="btn btn-primary" :disabled="loading">
        {{ loading ? 'Saving...' : submitLabel }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
defineProps<{
  machineAssetId: string
  problemDescription: string
  priority: string
  submitLabel: string
  loading: boolean
  errors?: Record<string, string[]>
}>()

defineEmits([
  'submit',
  'update:machineAssetId',
  'update:problemDescription',
  'update:priority',
])
</script>
