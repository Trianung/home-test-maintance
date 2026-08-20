<template>
  <div>
    <Teleport to="body">
      <div v-if="visible" class="dialog-overlay" @click.self="$emit('cancel')">
        <div class="dialog-box">
          <h3 class="dialog-title">{{ title }}</h3>
          <p class="dialog-message">{{ message }}</p>
          <div class="dialog-actions">
            <button class="btn btn-secondary" @click="$emit('cancel')">Cancel</button>
            <button class="btn" :class="confirmClass" :disabled="loading" @click="$emit('confirm')">
              {{ loading ? 'Processing...' : confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
  title: string
  message: string
  confirmText?: string
  confirmClass?: string
  loading?: boolean
}>()

defineEmits(['confirm', 'cancel'])
</script>
