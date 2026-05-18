// API-функции для объявлений недвижимости.
// Создание объявления отправляется на backend endpoint /listings/add_listing.

import { apiClient } from './axiosInstance'
import type { CreatePropertyRequest, Property } from '../types/property'

export async function createProperty(data: CreatePropertyRequest) {
  const response = await apiClient.post<Property>('/listings/add_listing', data)

  return response.data
}