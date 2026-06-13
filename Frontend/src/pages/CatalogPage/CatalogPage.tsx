// Страница каталога недвижимости.
// Получает объявления из backend через /listings/filter_search.
// Поиск рядом работает через /listings/nearby:
// пользователь выбирает точку на карте, frontend отправляет lat/lon/radius_km.

import { useMemo, useState } from 'react'
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
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <img
        src={currentPhoto}
        alt={property.title}
        className="h-56 w-full object-cover"
      />

      {photos.length > 1 && (
        <div className="flex gap-2 border-b border-slate-100 bg-slate-50 p-3">
          {photos.map((photo) => (
            <button
              key={photo}
              type="button"
              onClick={() => setSelectedPhoto(photo)}
              className={[
                'h-14 flex-1 overflow-hidden rounded-lg border transition',
                currentPhoto === photo
                  ? 'border-blue-600 ring-2 ring-blue-100'
                  : 'border-transparent hover:border-slate-300',
              ].join(' ')}
              aria-label="Выбрать фото объекта"
            >
              <img src={photo} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-2xl font-bold text-slate-900">
              {formatPrice(
                property.price,
                property.type,
                locale,
                t('property.perMonth'),
              )}
            </p>

            <p className="mt-1 text-sm font-medium text-blue-600">
              {dealTypeLabel}
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {property.rooms === 0
              ? t('catalog.studio')
              : `${property.rooms} ${t('property.rooms').toLowerCase()}`}
          </span>
        </div>

        <h2 className="mt-4 text-lg font-semibold text-slate-900">
          {property.title}
        </h2>

        <p className="mt-2 line-clamp-2 text-sm text-slate-600">
          {property.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-700">
          <span>{property.area} м²</span>
          <span>•</span>
          <span>{property.address}</span>
        </div>

        {property.infrastructure && (
          <div className="mt-4 flex flex-wrap gap-2">
            {property.infrastructure.metro && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                {t('property.transport')}
              </span>
            )}

            {property.infrastructure.school && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                {t('property.school')}
              </span>
            )}

            {property.infrastructure.park && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                {t('property.parks')}
              </span>
            )}

            {property.infrastructure.shop && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                {t('property.shops')}
              </span>
            )}
          </div>
        )}

        <Link
          to={`/properties/${property.id}`}
          className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          {t('common.details')}
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
      alert('Выберите точку на карте.')
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
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-blue-600">
          {t('catalog.realEstateCatalog')}
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          {t('catalog.title')}
        </h1>

        <p className="mt-3 max-w-2xl text-slate-600">
          {t('catalog.subtitle')}
        </p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr]">
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-slate-700"
            >
              {t('catalog.searchByAddress')}
            </label>

            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t('catalog.searchPlaceholder')}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="dealType"
              className="block text-sm font-medium text-slate-700"
            >
              {t('catalog.dealType')}
            </label>

            <select
              id="dealType"
              value={dealType}
              onChange={(event) =>
                setDealType(event.target.value as DealTypeFilter)
              }
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            >
              <option value="all">{t('catalog.all')}</option>
              <option value="sale">{t('property.sale')}</option>
              <option value="rent">{t('property.rent')}</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="sort"
              className="block text-sm font-medium text-slate-700"
            >
              {t('catalog.sort')}
            </label>

            <select
              id="sort"
              value={sortOption}
              onChange={(event) =>
                setSortOption(event.target.value as SortOption)
              }
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            >
              <option value="newest">{t('catalog.newest')}</option>
              <option value="priceAsc">{t('catalog.priceAsc')}</option>
              <option value="priceDesc">{t('catalog.priceDesc')}</option>
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label
              htmlFor="minPrice"
              className="block text-sm font-medium text-slate-700"
            >
              {t('catalog.priceFrom')}
            </label>

            <input
              id="minPrice"
              type="number"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              placeholder="0"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="maxPrice"
              className="block text-sm font-medium text-slate-700"
            >
              {t('catalog.priceTo')}
            </label>

            <input
              id="maxPrice"
              type="number"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder="10000000"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="rooms"
              className="block text-sm font-medium text-slate-700"
            >
              {t('catalog.rooms')}
            </label>

            <select
              id="rooms"
              value={rooms}
              onChange={(event) => setRooms(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            >
              <option value="">{t('catalog.any')}</option>
              <option value="0">{t('catalog.studio')}</option>
              <option value="1">{t('catalog.oneRoom')}</option>
              <option value="2">{t('catalog.twoRooms')}</option>
              <option value="3">{t('catalog.threeRooms')}</option>
              <option value="4">{t('catalog.fourRooms')}</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="minArea"
              className="block text-sm font-medium text-slate-700"
            >
              {t('catalog.areaFrom')}
            </label>

            <input
              id="minArea"
              type="number"
              value={minArea}
              onChange={(event) => setMinArea(event.target.value)}
              placeholder="30"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Поиск рядом на карте
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Кликните по точке на карте, чтобы найти активные объявления
                рядом в радиусе {nearbyRadiusKm} км.
              </p>
            </div>

            {isNearbyMode && (
              <button
                type="button"
                onClick={resetNearbySearch}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white"
              >
                Показать весь каталог
              </button>
            )}
          </div>

          <div className="mt-4">
            <NearbyMap
              selectedPoint={nearbyPoint}
              radiusKm={nearbyRadiusKm}
              onSelectPoint={setNearbyPoint}
            />
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              Радиус поиска:{' '}
              <span className="font-medium">{nearbyRadiusKm} км</span>
            </p>

            <button
              type="button"
              onClick={handleNearbySearch}
              disabled={nearbyPropertiesMutation.isPending || !nearbyPoint}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {nearbyPropertiesMutation.isPending
                ? 'Ищем...'
                : nearbyPoint
                  ? 'Найти рядом'
                  : 'Выберите точку на карте'}
            </button>
          </div>

          {nearbyPoint && (
            <p className="mt-3 text-sm text-slate-600">
              Точка выбрана. Можно запускать поиск рядом.
            </p>
          )}

          {isNearbyMode && nearbyPropertiesMutation.data && (
            <p className="mt-3 text-sm text-slate-600">
              Показаны объявления в радиусе{' '}
              <span className="font-medium">
                {nearbyPropertiesMutation.data.radius_km} км
              </span>{' '}
              от выбранной точки. Найдено по гео:{' '}
              <span className="font-medium">
                {nearbyPropertiesMutation.data.count}
              </span>
              .
            </p>
          )}

          {isNearbyError && (
            <p className="mt-3 text-sm font-medium text-red-600">
              Не удалось выполнить поиск рядом. Проверьте backend и параметры.
            </p>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            {t('catalog.found')}:{' '}
            <span className="font-medium">{filteredProperties.length}</span>
          </p>

          <button
            type="button"
            onClick={resetFilters}
            className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:w-auto"
          >
            {t('catalog.resetFilters')}
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-slate-600">
            {nearbyPropertiesMutation.isPending
              ? 'Ищем объявления рядом...'
              : t('catalog.loading')}
          </p>
        </div>
      )}

      {isCatalogError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-red-700">
            Не удалось загрузить каталог
          </h2>

          <p className="mt-2 text-sm text-red-600">
            Проверьте, что backend запущен, и попробуйте обновить страницу.
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
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">
                {isNearbyMode
                  ? 'Рядом ничего не найдено'
                  : t('catalog.notFoundTitle')}
              </h2>

              <p className="mt-2 text-slate-600">
                {isNearbyMode
                  ? 'Попробуйте выбрать другую точку на карте.'
                  : t('catalog.notFoundText')}
              </p>
            </div>
          )}
        </>
      )}
    </section>
  )
}