// Страница каталога недвижимости.
// Получает объявления из backend через /listings/filter_search.
// Поиск рядом работает через /listings/nearby:
// пользователь выбирает точку на карте, frontend отправляет lat/lon/radius_km.

import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getNearbyProperties, getProperties } from '../../api/propertiesApi'
import type { NearbyPropertiesParams } from '../../api/propertiesApi'
import {
  NearbyMap,
  type NearbyMapPoint,
} from '../../components/NearbyMap/NearbyMap'
import type { Property } from '../../types/property'

type DealTypeFilter = 'all' | Property['type']
type SortOption = 'newest' | 'priceAsc' | 'priceDesc'

const fallbackPhotoGroups = [
  [
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=1200&q=80',
  ],
  [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
  ],
  [
    'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
  ],
]

const nearbyRadiusKm = 50

function formatPrice(
  price: number,
  type: Property['type'],
  locale: string,
  perMonthLabel: string,
) {
  const formattedPrice = new Intl.NumberFormat(locale).format(price)

  return type === 'rent'
    ? `${formattedPrice} ₽/${perMonthLabel}`
    : `${formattedPrice} ₽`
}

function isDisplayablePhoto(photo: string) {
  return (
    photo.startsWith('http://') ||
    photo.startsWith('https://') ||
    photo.startsWith('/') ||
    photo.startsWith('blob:') ||
    photo.startsWith('data:image/')
  )
}

function getPropertyPhotos(property: Property) {
  const backendPhotos = property.photos.filter(isDisplayablePhoto)

  if (backendPhotos.length > 0) {
    return backendPhotos
  }

  const fallbackIndex = property.id % fallbackPhotoGroups.length

  return fallbackPhotoGroups[fallbackIndex]
}

type FilterPillProps = {
  value: string
  currentValue: string
  onChange: (value: string) => void
  children: ReactNode
}

function FilterPill({
  value,
  currentValue,
  onChange,
  children,
}: FilterPillProps) {
  const isActive = value === currentValue

  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={[
        'rounded-full px-4 py-2 text-sm font-semibold transition',
        isActive
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
          : 'bg-[#f7f2e8] text-slate-700 hover:bg-white hover:text-blue-700 hover:shadow-sm',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

type FilterInputProps = {
  id: string
  label: string
  value: string
  placeholder?: string
  onChange: (value: string) => void
}

function FilterInput({
  id,
  label,
  value,
  placeholder,
  onChange,
}: FilterInputProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-slate-800"
      >
        {label}
      </label>

      <input
        id={id}
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-[#d9cdb8] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
      />
    </div>
  )
}

function PropertyCard({ property }: { property: Property }) {
  const { t, i18n } = useTranslation()
  const photos = getPropertyPhotos(property)
  const [selectedPhoto, setSelectedPhoto] = useState(photos[0])

  const currentPhoto =
    selectedPhoto && photos.includes(selectedPhoto) ? selectedPhoto : photos[0]

  const locale = i18n.language === 'en' ? 'en-US' : 'ru-RU'
  const dealTypeLabel =
    property.type === 'sale' ? t('property.sale') : t('property.rent')

  return (
    <article className="group overflow-hidden rounded-[30px] border border-[#e2d6c3] bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-900/10">
      <div className="relative h-64 overflow-hidden">
        <img
          src={currentPhoto}
          alt={property.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/60 to-transparent" />

        <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-slate-800 shadow-sm backdrop-blur">
          {dealTypeLabel}
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-2xl font-bold text-white drop-shadow">
            {formatPrice(
              property.price,
              property.type,
              locale,
              t('property.perMonth'),
            )}
          </p>
        </div>
      </div>

      {photos.length > 1 && (
        <div className="flex gap-2 border-b border-[#eee6d8] bg-[#fbfaf7] p-3">
          {photos.slice(0, 3).map((photo) => (
            <button
              key={photo}
              type="button"
              onClick={() => setSelectedPhoto(photo)}
              className={[
                'h-14 flex-1 overflow-hidden rounded-2xl border transition',
                currentPhoto === photo
                  ? 'border-blue-600 ring-2 ring-blue-100'
                  : 'border-transparent opacity-80 hover:border-slate-300 hover:opacity-100',
              ].join(' ')}
              aria-label={t('catalog.selectObjectPhoto', {
                defaultValue: 'Выбрать фото объекта',
              })}
            >
              <img src={photo} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="line-clamp-2 text-lg font-bold text-slate-950">
              {property.title}
            </h2>

            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
              {property.description}
            </p>
          </div>

          <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            {property.rooms === 0
              ? t('catalog.studio')
              : `${property.rooms} ${t('property.rooms').toLowerCase()}`}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#f7f2e8] p-3">
            <p className="text-xs text-slate-500">{t('property.area')}</p>
            <p className="mt-1 font-bold text-slate-950">
              {property.area} м²
            </p>
          </div>

          <div className="rounded-2xl bg-[#f7f2e8] p-3">
            <p className="text-xs text-slate-500">{t('property.rooms')}</p>
            <p className="mt-1 font-bold text-slate-950">
              {property.rooms === 0 ? t('catalog.studio') : property.rooms}
            </p>
          </div>
        </div>

        <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
          {property.address}
        </p>

        {property.infrastructure && (
          <div className="mt-4 flex flex-wrap gap-2">
            {property.infrastructure.metro && (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {t('property.transport')}
              </span>
            )}

            {property.infrastructure.school && (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {t('property.school')}
              </span>
            )}

            {property.infrastructure.park && (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {t('property.park')}
              </span>
            )}

            {property.infrastructure.shop && (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {t('property.shops')}
              </span>
            )}
          </div>
        )}

        <Link
          to={`/properties/${property.id}`}
          className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-600"
        >
          {t('common.details')} →
        </Link>
      </div>
    </article>
  )
}

export function CatalogPage() {
  const { t } = useTranslation()

  const [searchQuery, setSearchQuery] = useState('')
  const [dealType, setDealType] = useState<DealTypeFilter>('all')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [rooms, setRooms] = useState('')
  const [minArea, setMinArea] = useState('')
  const [sortOption, setSortOption] = useState<SortOption>('newest')

  const [nearbyPoint, setNearbyPoint] = useState<NearbyMapPoint | null>(null)
  const [isNearbyMode, setIsNearbyMode] = useState(false)
  const [isMapSearchOpen, setIsMapSearchOpen] = useState(false)

  const propertiesQuery = useQuery({
    queryKey: ['catalog-properties'],
    queryFn: () =>
      getProperties({
        offset: 0,
        limit: 100,
      }),
  })

  const nearbyPropertiesMutation = useMutation({
    mutationFn: (params: NearbyPropertiesParams) => getNearbyProperties(params),
    onSuccess: () => {
      setIsNearbyMode(true)
    },
  })

  const baseProperties = isNearbyMode
    ? nearbyPropertiesMutation.data?.list_listings ?? []
    : propertiesQuery.data?.list_listings ?? []

  const sourceProperties = baseProperties.filter(
    (property) => property.status === 'active',
  )

  const filteredProperties = useMemo(() => {
    const normalizedSearchQuery = searchQuery.trim().toLowerCase()

    return sourceProperties
      .filter((property) => {
        const matchesSearch = normalizedSearchQuery
          ? property.address.toLowerCase().includes(normalizedSearchQuery)
          : true

        const matchesDealType =
          dealType === 'all' ? true : property.type === dealType

        const matchesMinPrice = minPrice
          ? property.price >= Number(minPrice)
          : true

        const matchesMaxPrice = maxPrice
          ? property.price <= Number(maxPrice)
          : true

        const matchesRooms = rooms ? property.rooms === Number(rooms) : true

        const matchesMinArea = minArea
          ? property.area >= Number(minArea)
          : true

        return (
          matchesSearch &&
          matchesDealType &&
          matchesMinPrice &&
          matchesMaxPrice &&
          matchesRooms &&
          matchesMinArea
        )
      })
      .sort((firstProperty, secondProperty) => {
        if (sortOption === 'priceAsc') {
          return firstProperty.price - secondProperty.price
        }

        if (sortOption === 'priceDesc') {
          return secondProperty.price - firstProperty.price
        }

        return (
          new Date(secondProperty.created_at).getTime() -
          new Date(firstProperty.created_at).getTime()
        )
      })
  }, [
    dealType,
    maxPrice,
    minArea,
    minPrice,
    rooms,
    searchQuery,
    sortOption,
    sourceProperties,
  ])

  const resetNearbySearch = () => {
    setIsNearbyMode(false)
    setNearbyPoint(null)
    nearbyPropertiesMutation.reset()
  }

  const resetFilters = () => {
    setSearchQuery('')
    setDealType('all')
    setMinPrice('')
    setMaxPrice('')
    setRooms('')
    setMinArea('')
    setSortOption('newest')
    resetNearbySearch()
  }

  const handleNearbySearch = () => {
    if (!nearbyPoint) {
      alert(
        t('catalog.selectMapPointAlert', {
          defaultValue: 'Выберите точку на карте.',
        }),
      )
      return
    }

    nearbyPropertiesMutation.mutate({
      lat: nearbyPoint.lat,
      lon: nearbyPoint.lon,
      radius_km: nearbyRadiusKm,
    })
  }

  const isLoading =
    propertiesQuery.isLoading || nearbyPropertiesMutation.isPending

  const isCatalogError = propertiesQuery.isError
  const isNearbyError = nearbyPropertiesMutation.isError

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[34px] border border-[#e2d6c3] bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1fr_0.9fr]">
          <div className="p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">
              {t('catalog.badge')}
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
              {t('catalog.title')}
            </h1>

            <p className="mt-4 max-w-2xl leading-7 text-slate-600">
              {t('catalog.subtitle')}
            </p>
          </div>

          <div className="hidden bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white lg:block">
            <div className="grid h-full grid-cols-2 gap-4">
              <div className="rounded-3xl bg-white/15 p-5 backdrop-blur">
                <p className="text-sm text-blue-100">
                  {t('catalog.objectsFound', {
                    defaultValue: 'Объектов найдено',
                  })}
                </p>

                <p className="mt-2 text-5xl font-bold">
                  {filteredProperties.length}
                </p>
              </div>

              <div className="rounded-3xl bg-white/15 p-5 backdrop-blur">
                <p className="text-sm text-blue-100">
                  {t('catalog.searchMode', {
                    defaultValue: 'Режим поиска',
                  })}
                </p>

                <p className="mt-2 text-xl font-bold">
                  {isNearbyMode
                    ? t('catalog.nearbyMode', {
                        defaultValue: 'Рядом',
                      })
                    : t('catalog.catalogMode', {
                        defaultValue: 'Каталог',
                      })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[30px] border border-[#e2d6c3] bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.9fr]">
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-semibold text-slate-800"
            >
              {t('catalog.searchByAddress', {
                defaultValue: 'Поиск по адресу',
              })}
            </label>

            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t('catalog.searchPlaceholder', {
                defaultValue: 'Введите город, улицу или район',
              })}
              className="mt-2 w-full rounded-2xl border border-[#d9cdb8] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <p className="block text-sm font-semibold text-slate-800">
              {t('catalog.dealType', {
                defaultValue: 'Тип сделки',
              })}
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              <FilterPill
                value="all"
                currentValue={dealType}
                onChange={(value) => setDealType(value as DealTypeFilter)}
              >
                {t('catalog.allTypes')}
              </FilterPill>

              <FilterPill
                value="sale"
                currentValue={dealType}
                onChange={(value) => setDealType(value as DealTypeFilter)}
              >
                {t('property.sale')}
              </FilterPill>

              <FilterPill
                value="rent"
                currentValue={dealType}
                onChange={(value) => setDealType(value as DealTypeFilter)}
              >
                {t('property.rent')}
              </FilterPill>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_1fr]">
          <div className="grid gap-4 sm:grid-cols-3">
            <FilterInput
              id="minPrice"
              label={t('catalog.priceFrom')}
              value={minPrice}
              onChange={setMinPrice}
              placeholder="0"
            />

            <FilterInput
              id="maxPrice"
              label={t('catalog.priceTo')}
              value={maxPrice}
              onChange={setMaxPrice}
              placeholder="10000000"
            />

            <FilterInput
              id="minArea"
              label={t('catalog.areaFrom')}
              value={minArea}
              onChange={setMinArea}
              placeholder="30"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="block text-sm font-semibold text-slate-800">
                {t('catalog.rooms')}
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                <FilterPill value="" currentValue={rooms} onChange={setRooms}>
                  {t('catalog.allRooms')}
                </FilterPill>

                <FilterPill value="0" currentValue={rooms} onChange={setRooms}>
                  {t('catalog.studio')}
                </FilterPill>

                <FilterPill value="1" currentValue={rooms} onChange={setRooms}>
                  1
                </FilterPill>

                <FilterPill value="2" currentValue={rooms} onChange={setRooms}>
                  2
                </FilterPill>

                <FilterPill value="3" currentValue={rooms} onChange={setRooms}>
                  3
                </FilterPill>

                <FilterPill value="4" currentValue={rooms} onChange={setRooms}>
                  4+
                </FilterPill>
              </div>
            </div>

            <div>
              <p className="block text-sm font-semibold text-slate-800">
                {t('catalog.sort')}
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                <FilterPill
                  value="newest"
                  currentValue={sortOption}
                  onChange={(value) => setSortOption(value as SortOption)}
                >
                  {t('catalog.sortNewest')}
                </FilterPill>

                <FilterPill
                  value="priceAsc"
                  currentValue={sortOption}
                  onChange={(value) => setSortOption(value as SortOption)}
                >
                  {t('catalog.sortPriceAsc')}
                </FilterPill>

                <FilterPill
                  value="priceDesc"
                  currentValue={sortOption}
                  onChange={(value) => setSortOption(value as SortOption)}
                >
                  {t('catalog.sortPriceDesc')}
                </FilterPill>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-[#eee6d8] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <p className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
              {t('catalog.found', {
                defaultValue: 'Найдено',
              })}
              : <span>{filteredProperties.length}</span>
            </p>

            {isNearbyMode && (
              <p className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                {t('catalog.nearbySearchActive', {
                  defaultValue: 'Поиск рядом активен',
                })}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => setIsMapSearchOpen((current) => !current)}
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-600/20"
            >
              {isMapSearchOpen
                ? t('catalog.hideMap', {
                    defaultValue: 'Скрыть карту',
                  })
                : t('catalog.mapSearch', {
                    defaultValue: 'Поиск на карте',
                  })}
            </button>

            <button
              type="button"
              onClick={resetFilters}
              className="rounded-2xl border border-[#d9cdb8] bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700 hover:shadow-sm"
            >
              {t('catalog.resetFilters')}
            </button>
          </div>
        </div>

        {isMapSearchOpen && (
          <div className="mt-5 rounded-3xl border border-[#e2d6c3] bg-[#fbfaf7] p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  {t('catalog.nearbyMapTitle', {
                    defaultValue: 'Поиск рядом на карте',
                  })}
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {t('catalog.nearbyMapText', {
                    radius: nearbyRadiusKm,
                    defaultValue:
                      'Кликните по точке на карте, чтобы найти активные объявления рядом.',
                  })}{' '}
                  {nearbyRadiusKm}{' '}
                  {t('catalog.km', {
                    defaultValue: 'км',
                  })}
                  .
                </p>
              </div>

              {isNearbyMode && (
                <button
                  type="button"
                  onClick={resetNearbySearch}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  {t('catalog.showFullCatalog', {
                    defaultValue: 'Показать весь каталог',
                  })}
                </button>
              )}
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
              <NearbyMap
                selectedPoint={nearbyPoint}
                radiusKm={nearbyRadiusKm}
                onSelectPoint={setNearbyPoint}
              />
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600">
                {t('catalog.searchRadius', {
                  defaultValue: 'Радиус поиска',
                })}
                :{' '}
                <span className="font-semibold">
                  {nearbyRadiusKm}{' '}
                  {t('catalog.km', {
                    defaultValue: 'км',
                  })}
                </span>
              </p>

              <button
                type="button"
                onClick={handleNearbySearch}
                disabled={nearbyPropertiesMutation.isPending || !nearbyPoint}
                className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {nearbyPropertiesMutation.isPending
                  ? t('catalog.searchingNearby', {
                      defaultValue: 'Ищем...',
                    })
                  : nearbyPoint
                    ? t('catalog.findNearby', {
                        defaultValue: 'Найти рядом',
                      })
                    : t('catalog.choosePointOnMap', {
                        defaultValue: 'Выберите точку на карте',
                      })}
              </button>
            </div>

            {nearbyPoint && (
              <p className="mt-3 text-sm text-slate-600">
                {t('catalog.pointSelectedText', {
                  defaultValue: 'Точка выбрана. Можно запускать поиск рядом.',
                })}
              </p>
            )}

            {isNearbyMode && nearbyPropertiesMutation.data && (
              <p className="mt-3 text-sm text-slate-600">
                {t('catalog.nearbyResultsStart', {
                  defaultValue: 'Показаны объявления в радиусе',
                })}{' '}
                <span className="font-semibold">
                  {nearbyPropertiesMutation.data.radius_km}{' '}
                  {t('catalog.km', {
                    defaultValue: 'км',
                  })}
                </span>{' '}
                {t('catalog.nearbyResultsMiddle', {
                  defaultValue: 'от выбранной точки. Найдено по гео',
                })}
                :{' '}
                <span className="font-semibold">
                  {nearbyPropertiesMutation.data.count}
                </span>
                .
              </p>
            )}

            {isNearbyError && (
              <p className="mt-3 text-sm font-medium text-red-600">
                {t('catalog.nearbyError', {
                  defaultValue:
                    'Не удалось выполнить поиск рядом. Проверьте backend и параметры.',
                })}
              </p>
            )}
          </div>
        )}
      </div>

      {isLoading && (
        <div className="rounded-[28px] border border-[#e2d6c3] bg-white p-8 text-center shadow-sm">
          <p className="text-slate-600">
            {nearbyPropertiesMutation.isPending
              ? t('catalog.nearbyLoading', {
                  defaultValue: 'Ищем объявления рядом...',
                })
              : t('catalog.loading')}
          </p>
        </div>
      )}

      {isCatalogError && (
        <div className="rounded-[28px] border border-red-200 bg-red-50 p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-red-700">
            {t('catalog.loadCatalogErrorTitle', {
              defaultValue: 'Не удалось загрузить каталог',
            })}
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {t('catalog.loadCatalogErrorText', {
              defaultValue: 'Войдите в аккаунт, чтобы увидеть объявления.',
            })}
          </p>
        </div>
      )}

      {!isLoading && !isCatalogError && (
        <>
          {filteredProperties.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-[#e2d6c3] bg-white p-8 text-center shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">
                {isNearbyMode
                  ? t('catalog.nearbyNotFoundTitle', {
                      defaultValue: 'Рядом ничего не найдено',
                    })
                  : t('catalog.emptyTitle')}
              </h2>

              <p className="mt-2 text-slate-600">
                {isNearbyMode
                  ? t('catalog.nearbyNotFoundText', {
                      defaultValue:
                        'Попробуйте выбрать другую точку на карте.',
                    })
                  : t('catalog.emptyText')}
              </p>
            </div>
          )}
        </>
      )}
    </section>
  )
}