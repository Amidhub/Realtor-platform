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
  minInvestment?: number
  priceGrowth?: string
}

export type BackendInvestmentRequest = {
  annual_yield: number
  min_investment: number
  payback_years: number
  roi: number
}

export type BasePropertyFields = {
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

export type CreatePropertyRequest = BasePropertyFields & {
  infrastructure?: number[] | null
  investment?: BackendInvestmentRequest | null
}

export type Property = BasePropertyFields & {
  id: number
  userId?: number | null
  created_at: string
  latitude?: number | null
  longitude?: number | null
  infrastructure?: Infrastructure
  investment?: InvestmentInfo
}