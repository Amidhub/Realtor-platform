// API-функции для объявлений недвижимости.
// Используются для создания объявления, загрузки фото и получения каталога с backend.

import { apiClient } from './axiosInstance'
import type {
  CreatePropertyRequest,
  DealType,
  ListingStatus,
  Property,
} from '../types/property'

type BackendListing = {
  id: number
  type: DealType
  title: string
  description: string
  price: number
  rooms: number
  area: number
  address: string
  status: ListingStatus
  photos?: string[]
  created_at: string
  updated_at?: string
  user_id?: number
}

type BackendListingsResponse = {
  list_listings: BackendListing[]
  count_listings: number
  offset: number
  limit: number | null
  has_more: boolean
}

export type GetPropertiesParams = {
  offset?: number
  limit?: number
  start_price?: number
  finish_price?: number
  rooms?: number
  type?: DealType
  sort_by?: 'price' | 'created_at'
  sort_order?: 'asc' | 'desc'
}

function getPhotoUrl(photo: string) {
  if (
    photo.startsWith('http://') ||
    photo.startsWith('https://') ||
    photo.startsWith('/') ||
    photo.startsWith('blob:') ||
    photo.startsWith('data:image/')
  ) {
    return photo
  }

  const s3PublicUrl = import.meta.env.VITE_S3_PUBLIC_URL

  if (s3PublicUrl) {
    return `${s3PublicUrl}/${photo}`
  }

  const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

  return `${apiUrl}/listings/photo/${photo}`
}

function mapBackendListingToProperty(listing: BackendListing): Property {
  return {
    id: listing.id,
    type: listing.type,
    title: listing.title,
    description: listing.description,
    price: listing.price,
    rooms: listing.rooms,
    area: listing.area,
    address: listing.address,
    status: listing.status,
    photos: listing.photos?.map(getPhotoUrl) ?? [],
    created_at: listing.created_at,
  }
}

export async function getProperties(params: GetPropertiesParams = {}) {
  const response = await apiClient.get<BackendListingsResponse>(
    '/listings/filter_search',
    {
      params,
    },
  )

  return {
    ...response.data,
    list_listings: response.data.list_listings.map(mapBackendListingToProperty),
  }
}

export async function createProperty(data: CreatePropertyRequest) {
  const response = await apiClient.post<Property>('/listings/add_listing', data)

  return response.data
}

export async function uploadPropertyPhotos(listingId: number, photos: File[]) {
  const formData = new FormData()

  photos.forEach((photo) => {
    formData.append('uploaded_files', photo)
  })

  const response = await apiClient.post(
    `/listings/add_listing_photos/${listingId}`,
    formData,
  )

  return response.data
}