// API-функции для объявлений недвижимости.
// Используются для создания объявления, загрузки фото, получения каталога,
// личного кабинета пользователя и модерации.

import imageCompression from 'browser-image-compression'
import { apiClient } from './axiosInstance'
import type {
  CreatePropertyRequest,
  DealType,
  ListingStatus,
  Property,
} from '../types/property'

type BackendInfrastructure =
  | number[]
  | Property['infrastructure']
  | null
  | undefined

type BackendInvestment = {
    roi?: number | null
    annual_yield?: number | null
    payback_years?: number | null
    min_investment?: number | null
    risk_level?: 'low' | 'medium' | 'high' | null
  } | null | undefined

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
  infrastructure?: BackendInfrastructure
  investment?: BackendInvestment
  latitude?: number | null
  longitude?: number | null
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

type BackendUserListingsResponse = {
  message?: string
  listings: BackendListing[]
}

type BackendListingsData =
  | BackendListing[]
  | BackendListingsResponse
  | BackendUserListingsResponse

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

function extractBackendListings(data: BackendListingsData) {
  if (Array.isArray(data)) {
    return data
  }

  if ('list_listings' in data) {
    return data.list_listings
  }

  return data.listings
}

function mapInfrastructureToProperty(
  infrastructure: BackendInfrastructure,
): Property['infrastructure'] | undefined {
  if (!infrastructure) {
    return undefined
  }

  if (!Array.isArray(infrastructure)) {
    const hasInfrastructureValues = Object.values(infrastructure).some(Boolean)

    return hasInfrastructureValues ? infrastructure : undefined
  }

  const infrastructureIds = infrastructure.map(Number)

  if (infrastructureIds.length === 0) {
    return undefined
  }

  const mappedInfrastructure = {
    metro: infrastructureIds.includes(1) ? 'Есть рядом' : undefined,
    school: infrastructureIds.includes(2) ? 'Есть рядом' : undefined,
    kindergarten: infrastructureIds.includes(3) ? 'Есть рядом' : undefined,
    park: infrastructureIds.includes(4) ? 'Есть рядом' : undefined,
    shop: infrastructureIds.includes(5) ? 'Есть рядом' : undefined,
    hospital: infrastructureIds.includes(6) ? 'Есть рядом' : undefined,
  }

  const hasInfrastructureValues =
    Object.values(mappedInfrastructure).some(Boolean)

  return hasInfrastructureValues ? mappedInfrastructure : undefined
}

function mapInvestmentToProperty(
  investment: BackendInvestment,
): Property['investment'] | undefined {
  if (!investment) {
    return undefined
  }

  const riskLevelLabels: Record<'low' | 'medium' | 'high', string> = {
    low: 'Низкий риск',
    medium: 'Средний риск',
    high: 'Высокий риск',
  }

  const mappedInvestment = {
    paybackYears: investment.payback_years ?? undefined,
    profitability: investment.annual_yield ?? investment.roi ?? undefined,
    minInvestment: investment.min_investment ?? undefined,
    priceGrowth: investment.risk_level
      ? riskLevelLabels[investment.risk_level]
      : undefined,
  }

  const hasInvestmentValues = Object.values(mappedInvestment).some(Boolean)

  return hasInvestmentValues ? mappedInvestment : undefined
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
    infrastructure: mapInfrastructureToProperty(listing.infrastructure),
    investment: mapInvestmentToProperty(listing.investment),
    latitude: listing.latitude,
    longitude: listing.longitude,
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

type CreatePropertyResponse = {
  id: number
  message?: string
}

export async function createProperty(data: CreatePropertyRequest) {
  const response = await apiClient.post<CreatePropertyResponse>(
    '/listings/add_listing',
    data,
  )

  return response.data
}

export async function uploadPropertyPhotos(listingId: number, photos: File[]) {
  const formData = new FormData()

  const compressedPhotos = await Promise.all(
    photos.map((photo) => {
      const maxOriginalSize = 1.5 * 1024 * 1024

      if (photo.size <= maxOriginalSize) {
        return photo
      }

      return imageCompression(photo, {
        maxSizeMB: 1.2,
        maxWidthOrHeight: 1800,
        useWebWorker: true,
      })
    }),
  )

  compressedPhotos.forEach((photo) => {
    formData.append('uploaded_files', photo)
  })

  const response = await apiClient.post(
    `/listings/add_listing_photos/${listingId}`,
    formData,
    {
      timeout: 120000,
    },
  )

  return response.data
}

export async function getMyProperties() {
  const response = await apiClient.get<BackendListingsData>('/listings/show')

  return extractBackendListings(response.data).map(mapBackendListingToProperty)
}

type BackendSingleListingResponse =
  | BackendListing
  | {
      listing: BackendListing
    }

function extractSingleBackendListing(data: BackendSingleListingResponse) {
  if ('listing' in data) {
    return data.listing
  }

  return data
}

export async function getPropertyById(propertyId: number) {
  const response = await apiClient.get<BackendSingleListingResponse>(
    '/listings/get_listing',
    {
      params: {
        listing_id: propertyId,
      },
    },
  )

  return mapBackendListingToProperty(extractSingleBackendListing(response.data))
}

export const getMyProperty = getPropertyById

export async function updateProperty(
  propertyId: number,
  data: Partial<CreatePropertyRequest>,
) {
  const response = await apiClient.patch<BackendListing>(
    `/listings/${propertyId}`,
    data,
  )

  return mapBackendListingToProperty(response.data)
}

export async function deleteProperty(propertyId: number) {
  const response = await apiClient.delete(`/listings/${propertyId}`)

  return response.data
}

export async function getModerationProperties() {
  const response =
    await apiClient.get<BackendListingsData>('/listings/moderation')

  return extractBackendListings(response.data).map(mapBackendListingToProperty)
}

export async function approveProperty(propertyId: number) {
  const response = await apiClient.patch(
    `/listings/moderation/${propertyId}/accept`,
  )

  return response.data
}

export async function rejectProperty(propertyId: number, reason?: string) {
  const response = await apiClient.patch(
    `/listings/moderation/${propertyId}/reject`,
    reason ? { reason } : undefined,
  )

  return response.data
}

export type ModerationLog = {
  id: number
  listing_id?: number
  moderator_id?: number
  action?: string
  status?: string
  reason?: string | null
  created_at?: string
}

type BackendModerationLogsResponse =
  | ModerationLog[]
  | {
      logs?: ModerationLog[]
      moderation_logs?: ModerationLog[]
      list_logs?: ModerationLog[]
    }

function extractModerationLogs(data: BackendModerationLogsResponse) {
  if (Array.isArray(data)) {
    return data
  }

  return data.logs ?? data.moderation_logs ?? data.list_logs ?? []
}

export async function getModerationLogs() {
  const response = await apiClient.get<BackendModerationLogsResponse>(
    '/listings/moderation/logs',
  )

  return extractModerationLogs(response.data)
}

export async function getModeratorModerationLogs(moderatorId: number) {
  const response = await apiClient.get<BackendModerationLogsResponse>(
    `/listings/moderation/logs/moderator/${moderatorId}`,
  )

  return extractModerationLogs(response.data)
}

export type NearbyPropertiesParams = {
  lat: number
  lon: number
  radius_km?: number
}

type BackendNearbyListingsResponse = {
  center: {
    lat: number
    lon: number
  }
  radius_km: number
  listings: BackendListing[]
  count: number
}

export async function getNearbyProperties(params: NearbyPropertiesParams) {
  const response = await apiClient.get<BackendNearbyListingsResponse>(
    '/listings/nearby',
    {
      params,
    },
  )

  return {
    ...response.data,
    list_listings: response.data.listings.map(mapBackendListingToProperty),
  }
}