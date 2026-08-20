import type { MaintenanceRequest } from '~/types/request'

export function useRequests() {
  const { apiFetch } = useApi()

  async function fetchRequests(query?: Record<string, string>) {
    const cleanQuery: Record<string, string> = {}
    if (query) {
      for (const [key, val] of Object.entries(query)) {
        if (val) cleanQuery[key] = val
      }
    }
    return await apiFetch<MaintenanceRequest[]>('/requests', {
      query: Object.keys(cleanQuery).length > 0 ? cleanQuery : undefined,
    })
  }

  async function fetchRequest(id: number) {
    return await apiFetch<MaintenanceRequest>(`/requests/${id}`)
  }

  async function createRequest(body: {
    machineAssetId: string
    problemDescription: string
    priority: string
  }) {
    return await apiFetch<{ message: string; data: MaintenanceRequest }>('/requests', {
      method: 'POST',
      body,
    })
  }

  async function updateRequest(id: number, body: {
    machineAssetId?: string
    problemDescription?: string
    priority?: string
  }) {
    return await apiFetch<{ message: string; data: MaintenanceRequest }>(`/requests/${id}`, {
      method: 'PUT',
      body,
    })
  }

  async function approveRequest(id: number) {
    return await apiFetch<{ message: string; data: MaintenanceRequest }>(`/requests/${id}/approve`, {
      method: 'POST',
    })
  }

  async function rejectRequest(id: number) {
    return await apiFetch<{ message: string; data: MaintenanceRequest }>(`/requests/${id}/reject`, {
      method: 'POST',
    })
  }

  async function deleteRequest(id: number) {
    return await apiFetch<{ message: string }>(`/requests/${id}`, {
      method: 'DELETE',
    })
  }

  return {
    fetchRequests,
    fetchRequest,
    createRequest,
    updateRequest,
    approveRequest,
    rejectRequest,
    deleteRequest,
  }
}
