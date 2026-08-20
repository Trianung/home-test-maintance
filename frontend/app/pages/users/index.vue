<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">User Management</h1>
      <button class="btn btn-primary" @click="openCreate"><Icon name="lucide:user-plus" size="1.1em" /> Create User</button>
    </div>

    <div v-if="successMsg" class="alert alert-success">{{ successMsg }}</div>

    <div class="card">
      <div v-if="loading" class="loading-state">Loading users...</div>
      <div v-else-if="error" class="error-state">Failed to load users.</div>
      <div v-else-if="users.length === 0" class="empty-state">No users found.</div>
      <UserTable
        v-else
        :users="users"
        @edit="openEdit"
        @deactivate="openDeactivate"
      />
    </div>

    <!-- Create / Edit Modal -->
    <Teleport to="body">
      <div v-if="showForm" class="dialog-overlay" @click.self="showForm = false">
        <div class="dialog-box" style="max-width: 500px;">
          <h3 class="dialog-title">{{ editingUser ? 'Edit User' : 'Create User' }}</h3>

          <div v-if="formError" class="alert alert-error">{{ formError }}</div>

          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label class="form-label" for="user-name">Name</label>
              <input id="user-name" v-model="form.name" type="text" class="form-input" required maxlength="100" />
            </div>

            <div class="form-group">
              <label class="form-label" for="user-email">Email</label>
              <input id="user-email" v-model="form.email" type="email" class="form-input" required maxlength="255" />
            </div>

            <div v-if="!editingUser" class="form-group">
              <label class="form-label" for="user-password">Password</label>
              <input id="user-password" v-model="form.password" type="password" class="form-input" required minlength="8" />
            </div>

            <div class="form-group">
              <label class="form-label" for="user-role">Role</label>
              <select id="user-role" v-model="form.role" class="form-select" required>
                <option value="" disabled>Select role</option>
                <option value="admin">Admin</option>
                <option value="supervisor">Supervisor</option>
                <option value="operator">Operator</option>
              </select>
            </div>

            <div class="dialog-actions">
              <button type="button" class="btn btn-secondary" @click="showForm = false">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="formLoading">
                {{ formLoading ? 'Saving...' : (editingUser ? 'Update' : 'Create') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Deactivate Dialog -->
    <ConfirmDialog
      :visible="showDeactivate"
      title="Deactivate User"
      :message="`Are you sure you want to deactivate ${deactivatingUser?.name}?`"
      confirm-text="Deactivate"
      confirm-class="btn-warning"
      :loading="deactivateLoading"
      @confirm="handleDeactivate"
      @cancel="showDeactivate = false"
    />
  </div>
</template>

<script setup lang="ts">
import type { UserRecord } from '~/types/user'

definePageMeta({
  middleware: ['auth', 'admin'],
})

const { fetchUsers, createUser, updateUser, deactivateUser } = useUsers()

const users = ref<UserRecord[]>([])
const loading = ref(true)
const error = ref(false)
const successMsg = ref('')

// Form state
const showForm = ref(false)
const editingUser = ref<UserRecord | null>(null)
const formLoading = ref(false)
const formError = ref('')
const form = ref({ name: '', email: '', password: '', role: '' })

// Deactivate state
const showDeactivate = ref(false)
const deactivatingUser = ref<UserRecord | null>(null)
const deactivateLoading = ref(false)

async function loadUsers() {
  loading.value = true
  error.value = false
  try {
    users.value = await fetchUsers()
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingUser.value = null
  form.value = { name: '', email: '', password: '', role: '' }
  formError.value = ''
  showForm.value = true
}

function openEdit(user: UserRecord) {
  editingUser.value = user
  form.value = { name: user.name, email: user.email, password: '', role: user.role }
  formError.value = ''
  showForm.value = true
}

function openDeactivate(user: UserRecord) {
  deactivatingUser.value = user
  showDeactivate.value = true
}

async function handleSubmit() {
  formLoading.value = true
  formError.value = ''

  try {
    if (editingUser.value) {
      await updateUser(editingUser.value.id, {
        name: form.value.name,
        email: form.value.email,
        role: form.value.role,
      })
      successMsg.value = 'User updated successfully.'
    } else {
      await createUser({
        name: form.value.name,
        email: form.value.email,
        password: form.value.password,
        role: form.value.role,
      })
      successMsg.value = 'User created successfully.'
    }
    showForm.value = false
    await loadUsers()
  } catch (err: any) {
    formError.value = err?.data?.message || 'Failed to save user.'
  } finally {
    formLoading.value = false
  }
}

async function handleDeactivate() {
  if (!deactivatingUser.value) return
  deactivateLoading.value = true

  try {
    await deactivateUser(deactivatingUser.value.id)
    successMsg.value = `${deactivatingUser.value.name} has been deactivated.`
    showDeactivate.value = false
    await loadUsers()
  } catch {
    successMsg.value = ''
  } finally {
    deactivateLoading.value = false
  }
}

onMounted(() => {
  loadUsers()
})
</script>
