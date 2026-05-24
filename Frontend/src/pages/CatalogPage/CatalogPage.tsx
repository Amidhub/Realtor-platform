// Страница каталога недвижимости.
// Получает объявления с backend через /listings/filter_search.
// Если backend недоступен, использует mock-данные как fallback.

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getProperties } from '../../api/propertiesApi'
import { mockProperties } from '../../data/mockProperties'
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

function formatPrice(price: number, type: Property['type']) {
  const formattedPrice = new Intl.NumberFormat('ru-RU').format(price)

  return type === 'rent' ? `${formattedPrice} ₽/мес.` : `${formattedPrice} ₽`
}

function getDealTypeLabel(type: Property['type']) {
  return type === 'sale' ? 'Продажа' : 'Аренда'
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
  const photos = getPropertyPhotos(property)
  const [selectedPhoto, setSelectedPhoto] = useState(photos[0])

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <img
        src={selectedPhoto}
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
                selectedPhoto === photo
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
              {formatPrice(property.price, property.type)}
            </p>

            <p className="mt-1 text-sm font-medium text-blue-600">
              {getDealTypeLabel(property.type)}
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {property.rooms === 0 ? 'Студия' : `${property.rooms} комн.`}
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
      </div>
    </article>
  )
}

export function CatalogPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [dealType, setDealType] = useState<DealTypeFilter>('all')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [rooms, setRooms] = useState('')
  const [minArea, setMinArea] = useState('')
  const [sortOption, setSortOption] = useState<SortOption>('newest')

  const backendParams = useMemo(() => {
    const sortBy: 'price' | 'created_at' =
      sortOption === 'newest' ? 'created_at' : 'price'
  
    const sortOrder: 'asc' | 'desc' =
      sortOption === 'priceAsc' ? 'asc' : 'desc'
  
    return {
      offset: 0,
      limit: 100,
      start_price: minPrice ? Number(minPrice) : undefined,
      finish_price: maxPrice ? Number(maxPrice) : undefined,
      rooms: rooms ? Number(rooms) : undefined,
      type: dealType === 'all' ? undefined : dealType,
      sort_by: sortBy,
      sort_order: sortOrder,
    }
  }, [dealType, maxPrice, minPrice, rooms, sortOption])

  const propertiesQuery = useQuery({
    queryKey: ['properties', backendParams],
    queryFn: () => getProperties(backendParams),
  })

  const sourceProperties =
    propertiesQuery.data?.list_listings ??
    (propertiesQuery.isError ? mockProperties : [])

  const filteredProperties = useMemo(() => {
    const normalizedSearchQuery = searchQuery.trim().toLowerCase()

    return sourceProperties
      .filter((property) => {
        const matchesSearch = property.address
          .toLowerCase()
          .includes(normalizedSearchQuery)

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

  const resetFilters = () => {
    setSearchQuery('')
    setDealType('all')
    setMinPrice('')
    setMaxPrice('')
    setRooms('')
    setMinArea('')
    setSortOption('newest')
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-blue-600">
          Каталог недвижимости
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Найдите подходящий объект
        </h1>

        <p className="mt-3 max-w-2xl text-slate-600">
          Используйте поиск по адресу, фильтры и сортировку, чтобы быстрее найти
          подходящее объявление.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        {propertiesQuery.isError && (
          <div className="mb-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              Backend сейчас не отвечает для каталога, поэтому отображаются
              mock-данные.
            </p>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr]">
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-slate-700"
            >
              Поиск по адресу
            </label>

            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Например, ул. Мира"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="dealType"
              className="block text-sm font-medium text-slate-700"
            >
              Тип сделки
            </label>

            <select
              id="dealType"
              value={dealType}
              onChange={(event) =>
                setDealType(event.target.value as DealTypeFilter)
              }
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            >
              <option value="all">Все</option>
              <option value="sale">Продажа</option>
              <option value="rent">Аренда</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="sort"
              className="block text-sm font-medium text-slate-700"
            >
              Сортировка
            </label>

            <select
              id="sort"
              value={sortOption}
              onChange={(event) =>
                setSortOption(event.target.value as SortOption)
              }
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            >
              <option value="newest">Сначала новые</option>
              <option value="priceAsc">Цена по возрастанию</option>
              <option value="priceDesc">Цена по убыванию</option>
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label
              htmlFor="minPrice"
              className="block text-sm font-medium text-slate-700"
            >
              Цена от
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
              Цена до
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
              Комнаты
            </label>

            <select
              id="rooms"
              value={rooms}
              onChange={(event) => setRooms(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            >
              <option value="">Любое</option>
              <option value="0">Студия</option>
              <option value="1">1 комната</option>
              <option value="2">2 комнаты</option>
              <option value="3">3 комнаты</option>
              <option value="4">4 комнаты</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="minArea"
              className="block text-sm font-medium text-slate-700"
            >
              Площадь от, м²
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

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            {propertiesQuery.isPending
              ? 'Загрузка объектов...'
              : (
                  <>
                    Найдено объектов:{' '}
                    <span className="font-medium">
                      {filteredProperties.length}
                    </span>
                  </>
                )}
          </p>

          <button
            type="button"
            onClick={resetFilters}
            className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:w-auto"
          >
            Сбросить фильтры
          </button>
        </div>
      </div>

      {filteredProperties.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Объекты не найдены
          </h2>

          <p className="mt-2 text-slate-600">
            Попробуйте изменить параметры поиска или сбросить фильтры.
          </p>
        </div>
      )}
    </section>
  )
}