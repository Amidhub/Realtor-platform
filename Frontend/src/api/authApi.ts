// API-функции для авторизации.
// Backend использует cookies: login ставит access_token и refresh_token в HttpOnly cookies.
// Backend также требует поле agreement, поэтому frontend отправляет agreement: true.

import { apiClient } from './axiosInstance'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
} from '../types/user'

export async function loginUser(data: LoginRequest) {
  const response = await apiClient.post<LoginResponse>('/auth/login', {
    email: data.email,
    password: data.password,
    agreement: true,
  })

  return response.data
}

export async function registerUser(data: RegisterRequest) {
  const response = await apiClient.post<RegisterResponse>('/auth/register', {
    email: data.email,
    password: data.password,
    agreement: true,
  })

  return response.data
}

export async function getCurrentUser() {
  const response = await apiClient.get<User>('/auth/me')

  return response.data
}

export async function getCurrentAccessToken() {
  const response = await apiClient.get<string>('/auth/token_curr_user')

  return response.data
}

export async function logoutUser() {
  await apiClient.delete('/auth/logout')
}