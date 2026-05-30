// Модераторский кабинет.
// Показывает объявления на модерации и позволяет редактировать, одобрять или отклонять их.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../app/AuthContext'
import {
  approveProperty,
  getModerationProperties,
  rejectProperty,
  updateProperty,
} from '../../api/propertiesApi'
import type { Property } from '../../types/property'

type ModerationEditForm = {
  title: string
  description: string
  price: number
  address: string
  rooms: number
  area: number
}

function formatPrice(price: number, type: Property['type']) {
  const formattedPrice = new Intl.NumberFormat('ru-RU').format(price)

  return type === 'rent' ? `${formattedPrice} ₽/мес.` : `${formattedPrice} ₽`
}

function getDealTypeLabel(type: Property['type']) {
  return type === 'sale' ? 'Продажа' : 'Аренда'
}

const fallbackPhoto =
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'

function getPropertyPhotos(property: Property) {
  return property.photos.length > 0 ? property.photos : [fallbackPhoto]
}

function PropertyPhotoGallery({ property }: { property: Property }) {
  const photos = getPropertyPhotos(property)
  const [selectedPhoto, setSelectedPhoto] = useState(photos[0])

  return (
    <div className="bg-slate-50">
      <img
        src={selectedPhoto}
        alt={property.title}
        className="h-48 w-full object-cover"
      />

      {photos.length > 1 && (
        <div className="grid grid-cols-3 gap-2 p-2">
          {photos.map((photo) => (
            <button
              key={photo}
              type="button"
              onClick={() => setSelectedPhoto(photo)}
              className={[
                'h-14 overflow-hidden rounded-lg border transition',
                selectedPhoto === photo
                  ? 'border-blue-600 ring-2 ring-blue-100'
                  : 'border-transparent hover:border-slate-300',
              ].join(' ')}
              aria-label="Выбрать фото объявления"
            >
              <img src={photo} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function getEditFormFromProperty(property: Property): ModerationEditForm {
  return {
    title: property.title,
    description: property.description,
    price: property.price,
    address: property.address,
    rooms: property.rooms,
    area: property.area,
  }
}

function ExpandableDescription({ text }: { text: string }) {
    const [isExpanded, setIsExpanded] = useState(false)
    const shouldShowToggle = text.length > 120
  
    return (
      <div className="mt-2">
        <p
          className={[
            'whitespace-pre-line break-words text-sm text-slate-600 [overflow-wrap:anywhere]',
            isExpanded ? '' : 'line-clamp-3',
          ].join(' ')}
        >
          {text}
        </p>
  
        {shouldShowToggle && (
          <button
            type="button"
            onClick={() => setIsExpanded((currentValue) => !currentValue)}
            className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            {isExpanded ? 'Скрыть' : 'Показать полностью'}
          </button>
        )}
      </div>
    )
  }

export function ModerationPage() {
  const queryClient = useQueryClient()
  const { user, isAuthenticated } = useAuth()

  const isModerator = isAuthenticated && user?.role === 'moderator'

  const [editingPropertyId, setEditingPropertyId] = useState<number | null>(
    null,
  )
  const [editForm, setEditForm] = useState<ModerationEditForm | null>(null)

  const {
    data: moderationProperties = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['moderation-properties'],
    queryFn: getModerationProperties,
    enabled: isModerator,
  })

  const updatePropertyMutation = useMutation({
    mutationFn: ({
      propertyId,
      data,
    }: {
      propertyId: number
      data: ModerationEditForm
    }) => updateProperty(propertyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-properties'] })
      setEditingPropertyId(null)
      setEditForm(null)
    },
  })

  const approvePropertyMutation = useMutation({
    mutationFn: approveProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-properties'] })
    },
  })

  const rejectPropertyMutation = useMutation({
    mutationFn: rejectProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-properties'] })
    },
  })

  const handleStartEdit = (property: Property) => {
    setEditingPropertyId(property.id)
    setEditForm(getEditFormFromProperty(property))
  }

  const handleCancelEdit = () => {
    setEditingPropertyId(null)
    setEditForm(null)
  }

  const handleSaveEdit = () => {
    if (!editingPropertyId || !editForm) {
      return
    }

    updatePropertyMutation.mutate({
      propertyId: editingPropertyId,
      data: editForm,
    })
  }

  const handleApprove = (propertyId: number) => {
    approvePropertyMutation.mutate(propertyId)
  }

  const handleReject = (propertyId: number) => {
    rejectPropertyMutation.mutate(propertyId)
  }

  const isActionPending =
    approvePropertyMutation.isPending || rejectPropertyMutation.isPending

  if (!isModerator) {
    return (
      <section className="mx-auto max-w-xl rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-blue-600">
          Доступ ограничен
        </p>

        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          Модераторский кабинет недоступен
        </h1>

        <p className="mt-3 text-slate-600">
          Эта страница доступна только пользователям с ролью модератора.
        </p>

        <Link
          to="/profile"
          className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
        >
          Вернуться в личный кабинет
        </Link>
      </section>
    )
  }

  return (
    <section className="space-y-8">
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-blue-600">
          Модераторский кабинет
        </p>

        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          Объявления на проверке
        </h1>

        <p className="mt-2 text-slate-600">
          Здесь модератор может проверить объявление, отредактировать его перед
          публикацией, одобрить или отклонить.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">На проверке</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {moderationProperties.length}
            </p>
          </div>

          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm text-green-700">Одобрение</p>
            <p className="mt-1 text-sm font-medium text-green-800">
              Объявление появится в каталоге
            </p>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">Отклонение</p>
            <p className="mt-1 text-sm font-medium text-red-800">
              Объявление не будет опубликовано
            </p>
          </div>
        </div>
      </div>

      {editForm && (
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wide text-blue-600">
            Проверка объявления
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            Редактировать перед публикацией
          </h2>

          <p className="mt-2 text-slate-600">
            После сохранения изменения будут отправлены на сервер.
          </p>

          {updatePropertyMutation.isError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              Не удалось сохранить изменения. Проверьте данные и попробуйте ещё
              раз.
            </div>
          )}

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Заголовок
              </label>

              <input
                value={editForm.title}
                onChange={(event) =>
                  setEditForm({
                    ...editForm,
                    title: event.target.value,
                  })
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Описание
              </label>

              <textarea
                value={editForm.description}
                onChange={(event) =>
                  setEditForm({
                    ...editForm,
                    description: event.target.value,
                  })
                }
                rows={4}
                className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Цена
              </label>

              <input
                type="number"
                value={editForm.price}
                onChange={(event) =>
                  setEditForm({
                    ...editForm,
                    price: Number(event.target.value),
                  })
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Адрес
              </label>

              <input
                value={editForm.address}
                onChange={(event) =>
                  setEditForm({
                    ...editForm,
                    address: event.target.value,
                  })
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Площадь, м²
              </label>

              <input
                type="number"
                value={editForm.area}
                onChange={(event) =>
                  setEditForm({
                    ...editForm,
                    area: Number(event.target.value),
                  })
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Количество комнат
              </label>

              <select
                value={editForm.rooms}
                onChange={(event) =>
                  setEditForm({
                    ...editForm,
                    rooms: Number(event.target.value),
                  })
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              >
                <option value={0}>Студия</option>
                <option value={1}>1 комната</option>
                <option value={2}>2 комнаты</option>
                <option value={3}>3 комнаты</option>
                <option value={4}>4 комнаты</option>
                <option value={5}>5+ комнат</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={updatePropertyMutation.isPending}
              className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {updatePropertyMutation.isPending
                ? 'Сохраняем...'
                : 'Сохранить изменения'}
            </button>

            <button
              type="button"
              onClick={handleCancelEdit}
              className="rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-blue-600">
              Очередь модерации
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Нужно проверить
            </h2>

            <p className="mt-2 text-slate-600">
              Эти объявления ожидают решения модератора.
            </p>
          </div>

          <p className="text-sm text-slate-500">
            Всего: {moderationProperties.length}
          </p>
        </div>

        {isLoading && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Загружаем объявления на модерации...
          </div>
        )}

        {isError && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            Не удалось загрузить объявления на модерации. Проверьте права
            доступа и попробуйте обновить страницу.
          </div>
        )}

        {!isLoading && !isError && moderationProperties.length === 0 && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="font-semibold text-slate-900">
              Объявлений на проверке нет
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              Когда пользователи отправят объявления на модерацию, они появятся
              здесь.
            </p>
          </div>
        )}

        {!isLoading && !isError && moderationProperties.length > 0 && (
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {moderationProperties.map((property) => (
              <article
                key={property.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
                    <PropertyPhotoGallery property={property} />

                  <div className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xl font-bold text-slate-900">
                          {formatPrice(property.price, property.type)}
                        </p>

                        <p className="mt-1 text-sm font-medium text-blue-600">
                          {getDealTypeLabel(property.type)}
                        </p>
                      </div>

                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                        На модерации
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-semibold text-slate-900">
                      {property.title}
                    </h3>
                    
                    <ExpandableDescription text={property.description} />

                    <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-700">
                      <span>{property.area} м²</span>
                      <span>•</span>
                      <span>
                        {property.rooms === 0
                          ? 'Студия'
                          : `${property.rooms} комн.`}
                      </span>
                      <span>•</span>
                      <span>{property.address}</span>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(property)}
                        className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Редактировать
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApprove(property.id)}
                        disabled={isActionPending}
                        className="rounded-xl border border-green-200 px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {approvePropertyMutation.isPending
                          ? 'Одобряем...'
                          : 'Одобрить'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReject(property.id)}
                        disabled={isActionPending}
                        className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {rejectPropertyMutation.isPending
                          ? 'Отклоняем...'
                          : 'Отклонить'}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}