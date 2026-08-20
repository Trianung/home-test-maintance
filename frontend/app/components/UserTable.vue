<template>
  <div class="table-container">
    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Active</th>
          <th>Created At</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in users" :key="u.id">
          <td>{{ u.id }}</td>
          <td>{{ u.name }}</td>
          <td>{{ u.email }}</td>
          <td><span class="badge badge-submitted" style="text-transform: capitalize;">{{ u.role }}</span></td>
          <td>
            <span class="badge" :class="u.isActive ? 'badge-approved' : 'badge-rejected'">
              {{ u.isActive ? 'Active' : 'Inactive' }}
            </span>
          </td>
          <td>{{ formatDate(u.createdAt) }}</td>
          <td style="display: flex; gap: 4px;">
            <button class="btn btn-secondary btn-sm" @click="$emit('edit', u)"><Icon name="lucide:pencil" size="1em" /> Edit</button>
            <button
              v-if="u.isActive"
              class="btn btn-warning btn-sm"
              @click="$emit('deactivate', u)"
            >
              <Icon name="lucide:user-x" size="1em" /> Deactivate
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { UserRecord } from '~/types/user'

defineProps<{ users: UserRecord[] }>()
defineEmits(['edit', 'deactivate'])

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}
</script>
