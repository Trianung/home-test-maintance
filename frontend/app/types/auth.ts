export type Role = 'admin' | 'supervisor' | 'operator'

export interface User {
  id: number
  name: string
  email: string
  role: Role
}

export interface LoginResponse {
  message: string
  token: string
  user: User
}

export interface MeResponse {
  user: User
}
