// Базовый axios-клиент для запросов к backend.
// Backend использует HttpOnly cookies, поэтому включён withCredentials.

import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})