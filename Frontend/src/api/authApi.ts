// API-функции для авторизации.
// Backend использует cookies: login ставит access_token и refresh_token в HttpOnly cookies.

import { apiClient } from './axiosInstance'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
} from '../types/user'

export async function loginUser(data: LoginRequest) {
  const response = await apiClient.post<LoginResponse>('/auth/login', data)

  return response.data
}

export async function registerUser(data: RegisterRequest) {
  const response = await apiClient.post<RegisterResponse>('/auth/register', data)

  return response.data
}

export async function getCurrentUser() {
  const response = await apiClient.get<User>('/auth/me')

  return response.data
}

export async function logoutUser() {
  await apiClient.delete('/auth/logout')
}