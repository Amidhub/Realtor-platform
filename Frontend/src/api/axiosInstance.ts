// Базовый axios-клиент для запросов к backend.
// Backend использует HttpOnly cookies, поэтому включён withCredentials.
// Если access_token истёк и backend вернул 401, frontend обновляет токен через /auth/refresh
// и повторяет исходный запрос.

import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

type RetryRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

let refreshPromise: Promise<unknown> | null = null

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 10000,
})

apiClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryRequestConfig | undefined

    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error)
    }

    const requestUrl = originalRequest.url ?? ''

    const isAuthRequest =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/logout') ||
      requestUrl.includes('/auth/refresh')

    if (originalRequest._retry || isAuthRequest) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post(`${API_URL}/auth/refresh`, {}, { withCredentials: true })
          .finally(() => {
            refreshPromise = null
          })
      }

      await refreshPromise

      return apiClient(originalRequest)
    } catch (refreshError) {
      return Promise.reject(refreshError)
    }
  },
)