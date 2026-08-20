import type { Role } from './auth'

export interface UserRecord {
  id: number
  name: string
  email: string
  role: Role
  isActive: boolean
  createdAt: string
  updatedAt: string
}
