// Типы объявления недвижимости.
// Поля соответствуют backend-схеме Listing_S.

export type DealType = 'sale' | 'rent'

export type ListingStatus = 'draft' | 'moderation' | 'active' | 'rejected'

export type CreatePropertyRequest = {
  type: DealType
  title: string
  description: string
  price: number
  rooms: number
  area: number
  address: string
  status: ListingStatus
  photos: string[]
}

export type Property = CreatePropertyRequest & {
  id?: number
  created_at?: string
}