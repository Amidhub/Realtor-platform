// Типы пользователя и авторизации.
// Backend принимает email/password/agreement и возвращает пользователя через /auth/me.

export type UserRole = 'user' | 'moderator'

export type User = {
  id: number
  email: string
  role: UserRole
  created_at?: string
}

export type LoginRequest = {
  email: string
  password: string
  agreement?: boolean
}

export type RegisterRequest = {
  email: string
  password: string
  agreement?: boolean
}

export type LoginResponse = {
  message: string
}

export type RegisterResponse = {
  inf: string
}