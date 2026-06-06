// Типы объявления недвижимости.
// Базовые поля соответствуют backend-схеме Listing_S и используются в каталоге.

export type DealType = 'sale' | 'rent'

export type ListingStatus = 'draft' | 'moderation' | 'active' | 'rejected'

export type Infrastructure = {
  metro?: string
  school?: string
  kindergarten?: string
  shop?: string
  hospital?: string
  park?: string
}

export type InvestmentInfo = {
  monthlyRent?: number
  paybackYears?: number
  profitability?: number
  priceGrowth?: string
}

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
  id: number
  created_at: string

  // Поля для 4 недели.
  // Пока используются на frontend через mock-данные.
  // Позже можно будет связать с backend, если он начнет отдавать эти поля.
  infrastructure?: Infrastructure
  investment?: InvestmentInfo
}