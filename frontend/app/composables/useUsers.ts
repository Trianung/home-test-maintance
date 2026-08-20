import type { UserRecord } from '~/types/user'

export function useUsers() {
  const { apiFetch } = useApi()

  async function fetchUsers() {
    return await apiFetch<UserRecord[]>('/users')
  }

  async function createUser(body: {
    name: string
    email: string
    password: string
    role: string
  }) {
    return await apiFetch<{ message: string; data: UserRecord }>('/users', {
      method: 'POST',
      body,
    })
  }

  async function updateUser(id: number, body: {
    name: string
    email: string
    role: string
  }) {
    return await apiFetch<{ message: string; data: UserRecord }>(`/users/${id}`, {
      method: 'PUT',
      body,
    })
  }

  async function deactivateUser(id: number) {
    return await apiFetch<{ message: string; data: UserRecord }>(`/users/${id}/deactivate`, {
      method: 'PATCH',
    })
  }

  return { fetchUsers, createUser, updateUser, deactivateUser }
}
