export type RequestStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED'

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface MaintenanceRequest {
  id: number
  machineAssetId: string
  problemDescription: string
  priority: Priority
  status: RequestStatus
  createdBy: number
  createdAt: string
  lastReviewedBy: number | null
  lastReviewedAt: string | null
  updatedAt: string
}
