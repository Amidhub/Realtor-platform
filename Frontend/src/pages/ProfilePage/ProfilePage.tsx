// Личный кабинет пользователя.
// Показывает объявления текущего пользователя и позволяет редактировать/удалять их.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../app/AuthContext'
import {
  deleteProperty,
  getMyProperties,
  updateProperty,
} from '../../api/propertiesApi'
import type { Property } from '../../types/property'

type EditPropertyForm = {
  type: Property['type']
  title: string
  description: string
  price: number
  rooms: number
  area: number
  address: string

  hasMetro: boolean
  hasSchool: boolean
  hasKindergarten: boolean
  hasPark: boolean
  hasShops: boolean
  hasHospital: boolean

  minInvestment?: number
  rentalYield?: number
  paybackYears?: number
}

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

function getStatusClass(status: Property['status']) {
  const statusClasses: Record<Property['status'], string> = {
    draft: 'bg-slate-100 text-slate-700',
    moderation: 'bg-yellow-100 text-yellow-800',
    active: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  }

  return statusClasses[status]
}

function getOptionalNumber(value: string) {
  return value === '' ? undefined : Number(value)
}

function getInfrastructureFromEditForm(form: EditPropertyForm) {
  return [
    form.hasMetro ? 1 : null,
    form.hasSchool ? 2 : null,
    form.hasKindergarten ? 3 : null,
    form.hasPark ? 4 : null,
    form.hasShops ? 5 : null,
    form.hasHospital ? 6 : null,
  ].filter((item): item is number => item !== null)
}

function getInvestmentFromEditForm(form: EditPropertyForm) {
  const hasInvestmentData =
    form.minInvestment !== undefined ||
    form.rentalYield !== undefined ||
    form.paybackYears !== undefined

  if (!hasInvestmentData) {
    return null
  }

  return {
    annual_yield: form.rentalYield ?? 1,
    min_investment: form.minInvestment ?? 1,
    payback_years: form.paybackYears ?? 1,
    roi: form.rentalYield ?? 1,
  }
}

const fallbackPhoto =
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'

function getPropertyPhotos(property: Property) {
  return property.photos.length > 0 ? property.photos : [fallbackPhoto]
}

type PropertyPhotoGalleryProps = {
  property: Property
  selectPhotoLabel: string
}

function PropertyPhotoGallery({
  property,
  selectPhotoLabel,
}: PropertyPhotoGalleryProps) {
  const photos = getPropertyPhotos(property)
  const [selectedPhoto, setSelectedPhoto] = useState(photos[0])

  const currentPhoto =
    selectedPhoto && photos.includes(selectedPhoto) ? selectedPhoto : photos[0]

  return (
    <div className="bg-slate-50">
      <img
        src={currentPhoto}
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
                currentPhoto === photo
                  ? 'border-blue-600 ring-2 ring-blue-100'
                  : 'border-transparent hover:border-slate-300',
              ].join(' ')}
              aria-label={selectPhotoLabel}
            >
              <img src={photo} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function getEditFormFromProperty(property: Property): EditPropertyForm {
  return {
    type: property.type,
    title: property.title,
    description: property.description,
    price: property.price,
    rooms: property.rooms,
    area: property.area,
    address: property.address,

    hasMetro: Boolean(property.infrastructure?.metro),
    hasSchool: Boolean(property.infrastructure?.school),
    hasKindergarten: Boolean(property.infrastructure?.kindergarten),
    hasPark: Boolean(property.infrastructure?.park),
    hasShops: Boolean(property.infrastructure?.shop),
    hasHospital: Boolean(property.infrastructure?.hospital),

    minInvestment: property.investment?.minInvestment,
    rentalYield: property.investment?.profitability,
    paybackYears: property.investment?.paybackYears,
  }
}

type ExpandableDescriptionProps = {
  text: string
  showFullLabel: string
  hideFullLabel: string
}

function ExpandableDescription({
  text,
  showFullLabel,
  hideFullLabel,
}: ExpandableDescriptionProps) {
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
          {isExpanded ? hideFullLabel : showFullLabel}
        </button>
      )}
    </div>
  )
}

export function ProfilePage() {
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const { t, i18n } = useTranslation()

  const locale = i18n.language === 'en' ? 'en-US' : 'ru-RU'

  const [editingPropertyId, setEditingPropertyId] = useState<number | null>(
    null,
  )
  const [editForm, setEditForm] = useState<EditPropertyForm | null>(null)
  const [deletingPropertyId, setDeletingPropertyId] = useState<number | null>(
    null,
  )

  const {
    data: myProperties = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['my-properties'],
    queryFn: getMyProperties,
    enabled: isAuthenticated,
  })

  const updatePropertyMutation = useMutation({
    mutationFn: ({
      propertyId,
      data,
    }: {
      propertyId: number
      data: EditPropertyForm
    }) =>
      updateProperty(propertyId, {
        type: data.type,
        title: data.title,
        description: data.description,
        price: data.price,
        rooms: data.rooms,
        area: data.area,
        address: data.address,
        status: 'moderation',
        infrastructure: getInfrastructureFromEditForm(data),
        investment: getInvestmentFromEditForm(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-properties'] })
      queryClient.invalidateQueries({ queryKey: ['catalog-properties'] })
      queryClient.invalidateQueries({ queryKey: ['moderation-properties'] })
      setEditingPropertyId(null)
      setEditForm(null)
    },
    onError: () => {
      alert('Не удалось обновить объявление. Попробуйте ещё раз.')
    },
  })

  const deletePropertyMutation = useMutation({
    mutationFn: async (propertyId: number) => {
      await deleteProperty(propertyId)
      return propertyId
    },
    onMutate: (propertyId) => {
      setDeletingPropertyId(propertyId)
    },
    onSuccess: (deletedPropertyId) => {
      queryClient.setQueryData<Property[]>(
        ['my-properties'],
        (currentProperties = []) =>
          currentProperties.filter(
            (property) => property.id !== deletedPropertyId,
          ),
      )

      queryClient.invalidateQueries({ queryKey: ['my-properties'] })
    },
    onError: () => {
      alert('Не удалось удалить объявление. Попробуйте ещё раз.')
    },
    onSettled: () => {
      setDeletingPropertyId(null)
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

  const handleDeleteProperty = (propertyId: number) => {
    const isConfirmed = window.confirm(t('profile.deleteConfirm'))

    if (!isConfirmed) {
      return
    }

    deletePropertyMutation.mutate(propertyId)

    if (editingPropertyId === propertyId) {
      handleCancelEdit()
    }
  }

  const statusLabels: Record<Property['status'], string> = {
    draft: t('profile.draft'),
    moderation: t('profile.moderation'),
    active: t('profile.active'),
    rejected: t('profile.rejected'),
  }

  if (!isAuthenticated || !user) {
    return (
      <section className="mx-auto max-w-xl rounded-2xl bg-white p-4 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">
          {t('profile.notAuthenticatedTitle')}
        </h1>

        <p className="mt-3 text-slate-600">
          {t('profile.notAuthenticatedText')}
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/login"
            className="rounded-xl bg-blue-600 px-5 py-3 text-center font-medium text-white hover:bg-blue-700"
          >
            {t('common.login')}
          </Link>

          <Link
            to="/register"
            className="rounded-xl border border-slate-300 px-5 py-3 text-center font-medium text-slate-700 hover:bg-slate-50"
          >
            {t('common.register')}
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-8">
      <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-8">
        <p className="text-sm font-medium uppercase tracking-wide text-blue-600">
          {t('profile.profileBadge')}
        </p>

        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          {t('profile.title')}
        </h1>

        <p className="mt-2 text-slate-600">
          {t('profile.loggedInAs')}{' '}
          <span className="font-medium">{user.email}</span>.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            to="/create-property"
            className="rounded-xl bg-blue-600 px-5 py-3 text-center font-medium text-white transition hover:bg-blue-700"
          >
            {t('profile.createProperty')}
          </Link>

          <Link
            to="/catalog"
            className="rounded-xl border border-slate-300 px-5 py-3 text-center font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {t('profile.goToCatalog')}
          </Link>
        </div>
      </div>

      {editForm && (
        <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-8">
          <p className="text-sm font-medium uppercase tracking-wide text-blue-600">
            {t('profile.editBadge')}
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            {t('profile.editTitle')}
          </h2>

          <p className="mt-2 text-slate-600">{t('profile.editSubtitle')}</p>

          {updatePropertyMutation.isError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {t('profile.updateError')}
            </div>
          )}

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t('profile.dealType')}
              </label>

              <select
                value={editForm.type}
                onChange={(event) =>
                  setEditForm({
                    ...editForm,
                    type: event.target.value as Property['type'],
                  })
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              >
                <option value="sale">{t('property.sale')}</option>
                <option value="rent">{t('property.rent')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t('profile.roomsLabel')}
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
                <option value={0}>{t('catalog.studio')}</option>
                <option value={1}>{t('catalog.oneRoom')}</option>
                <option value={2}>{t('catalog.twoRooms')}</option>
                <option value={3}>{t('catalog.threeRooms')}</option>
                <option value={4}>{t('catalog.fourRooms')}</option>
                <option value={5}>5+</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                {t('profile.titleLabel')}
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
                {t('profile.descriptionLabel')}
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
                {t('profile.priceLabel')}
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
                {t('profile.addressLabel')}
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
                {t('profile.areaLabel')}
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

            <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Инфраструктура рядом
              </h3>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={editForm.hasMetro}
                    onChange={(event) =>
                      setEditForm({
                        ...editForm,
                        hasMetro: event.target.checked,
                      })
                    }
                  />
                  Метро / остановка рядом
                </label>

                <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={editForm.hasSchool}
                    onChange={(event) =>
                      setEditForm({
                        ...editForm,
                        hasSchool: event.target.checked,
                      })
                    }
                  />
                  Школа
                </label>

                <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={editForm.hasKindergarten}
                    onChange={(event) =>
                      setEditForm({
                        ...editForm,
                        hasKindergarten: event.target.checked,
                      })
                    }
                  />
                  Детский сад
                </label>

                <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={editForm.hasPark}
                    onChange={(event) =>
                      setEditForm({
                        ...editForm,
                        hasPark: event.target.checked,
                      })
                    }
                  />
                  Парк
                </label>

                <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={editForm.hasShops}
                    onChange={(event) =>
                      setEditForm({
                        ...editForm,
                        hasShops: event.target.checked,
                      })
                    }
                  />
                  Магазины
                </label>

                <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={editForm.hasHospital}
                    onChange={(event) =>
                      setEditForm({
                        ...editForm,
                        hasHospital: event.target.checked,
                      })
                    }
                  />
                  Больница / поликлиника
                </label>
              </div>
            </div>

            <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Инвестиционная информация
              </h3>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Минимальная инвестиция, ₽
                  </label>

                  <input
                    type="number"
                    value={editForm.minInvestment ?? ''}
                    onChange={(event) =>
                      setEditForm({
                        ...editForm,
                        minInvestment: getOptionalNumber(event.target.value),
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Доходность, % годовых
                  </label>

                  <input
                    type="number"
                    value={editForm.rentalYield ?? ''}
                    onChange={(event) =>
                      setEditForm({
                        ...editForm,
                        rentalYield: getOptionalNumber(event.target.value),
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Окупаемость, лет
                  </label>

                  <input
                    type="number"
                    value={editForm.paybackYears ?? ''}
                    onChange={(event) =>
                      setEditForm({
                        ...editForm,
                        paybackYears: getOptionalNumber(event.target.value),
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={updatePropertyMutation.isPending}
              className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {updatePropertyMutation.isPending
                ? t('profile.saving')
                : t('profile.saveChanges')}
            </button>

            <button
              type="button"
              onClick={handleCancelEdit}
              className="rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {t('profile.myProperties')}
            </h2>

            <p className="mt-2 text-slate-600">
              {t('profile.managePropertiesText')}
            </p>
          </div>

          <p className="text-sm text-slate-500">
            {t('profile.total')}: {myProperties.length}
          </p>
        </div>

        {isLoading && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            {t('profile.loadingProperties')}
          </div>
        )}

        {isError && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {t('profile.loadError')}
          </div>
        )}

        {!isLoading && !isError && myProperties.length === 0 && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="font-semibold text-slate-900">
              {t('profile.emptyTitle')}
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              {t('profile.emptyText')}
            </p>

            <Link
              to="/create-property"
              className="mt-4 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              {t('profile.createProperty')}
            </Link>
          </div>
        )}

        {!isLoading && !isError && myProperties.length > 0 && (
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {myProperties.map((property) => (
              <article
                key={property.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
                  <PropertyPhotoGallery
                    property={property}
                    selectPhotoLabel={t('profile.selectPhoto')}
                  />

                  <div className="min-w-0 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xl font-bold text-slate-900">
                          {formatPrice(
                            property.price,
                            property.type,
                            locale,
                            t('property.perMonth'),
                          )}
                        </p>

                        <p className="mt-1 text-sm font-medium text-blue-600">
                          {property.type === 'sale'
                            ? t('property.sale')
                            : t('property.rent')}
                        </p>
                      </div>

                      <span
                        className={[
                          'rounded-full px-3 py-1 text-xs font-medium',
                          getStatusClass(property.status),
                        ].join(' ')}
                      >
                        {statusLabels[property.status]}
                      </span>
                    </div>

                    <h3 className="mt-4 break-words text-lg font-semibold text-slate-900 [overflow-wrap:anywhere]">
                      {property.title}
                    </h3>

                    <ExpandableDescription
                      text={property.description}
                      showFullLabel={t('profile.showFull')}
                      hideFullLabel={t('profile.hideFull')}
                    />

                    <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-700">
                      <span>{property.area} м²</span>
                      <span>•</span>
                      <span>
                        {property.rooms === 0
                          ? t('catalog.studio')
                          : `${property.rooms} ${t(
                              'property.rooms',
                            ).toLowerCase()}`}
                      </span>
                      <span>•</span>
                      <span>{property.address}</span>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(property)}
                        className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        {t('common.edit')}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteProperty(property.id)}
                        disabled={deletingPropertyId === property.id}
                        className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingPropertyId === property.id
                          ? t('profile.deleting')
                          : t('common.delete')}
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