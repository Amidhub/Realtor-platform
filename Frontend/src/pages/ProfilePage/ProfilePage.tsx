import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../app/AuthContext'
import {
  deleteProperty,
  getMyProperties,
  updateProperty,
} from '../../api/propertiesApi'
import { DeleteAccountSection } from '../../components/DeleteAccountSection/DeleteAccountSection'
import { InboxMessages } from '../../components/InboxMessages/InboxMessages'
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
    moderation: 'bg-amber-100 text-amber-800',
    active: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-700',
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
    <div className="relative overflow-hidden bg-slate-100">
      <img
        src={currentPhoto}
        alt={property.title}
        className="h-56 w-full object-cover transition duration-500"
      />

      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/55 to-transparent" />

      {photos.length > 1 && (
        <div className="absolute bottom-3 left-3 right-3 grid grid-cols-3 gap-2">
          {photos.slice(0, 3).map((photo) => (
            <button
              key={photo}
              type="button"
              onClick={() => setSelectedPhoto(photo)}
              className={[
                'h-12 overflow-hidden rounded-xl border transition',
                currentPhoto === photo
                  ? 'border-white ring-2 ring-white/70'
                  : 'border-white/40 opacity-80 hover:opacity-100',
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
    <div className="mt-3">
      <p
        className={[
          'whitespace-pre-line break-words text-sm leading-6 text-slate-600 [overflow-wrap:anywhere]',
          isExpanded ? '' : 'line-clamp-3',
        ].join(' ')}
      >
        {text}
      </p>

      {shouldShowToggle && (
        <button
          type="button"
          onClick={() => setIsExpanded((currentValue) => !currentValue)}
          className="mt-2 text-sm font-bold text-blue-600 hover:text-blue-700"
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
      alert(
        t('profile.updateAlertError', {
          defaultValue: 'Не удалось обновить объявление. Попробуйте ещё раз.',
        }),
      )
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
      alert(
        t('profile.deleteAlertError', {
          defaultValue: 'Не удалось удалить объявление. Попробуйте ещё раз.',
        }),
      )
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
    const isConfirmed = window.confirm(
      t('profile.deleteConfirm', {
        defaultValue: 'Удалить объявление?',
      }),
    )

    if (!isConfirmed) {
      return
    }

    deletePropertyMutation.mutate(propertyId)

    if (editingPropertyId === propertyId) {
      handleCancelEdit()
    }
  }

  const statusLabels: Record<Property['status'], string> = {
    draft: t('profile.draft', { defaultValue: 'Черновик' }),
    moderation: t('profile.moderation', { defaultValue: 'На модерации' }),
    active: t('profile.active', { defaultValue: 'Опубликовано' }),
    rejected: t('profile.rejected', { defaultValue: 'Отклонено' }),
  }

  if (!isAuthenticated || !user) {
    return (
      <section className="mx-auto max-w-xl rounded-[34px] border border-[#e2d6c3] bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">
          {t('profile.profileBadge', {
            defaultValue: 'Личный кабинет',
          })}
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-950">
          {t('profile.notAuthenticatedTitle', {
            defaultValue: 'Войдите в аккаунт',
          })}
        </h1>

        <p className="mt-3 leading-7 text-slate-600">
          {t('profile.notAuthenticatedText', {
            defaultValue:
              'Для просмотра личного кабинета необходимо войти или зарегистрироваться.',
          })}
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/login"
            className="rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20"
          >
            {t('common.login')}
          </Link>

          <Link
            to="/register"
            className="rounded-2xl border border-[#d9cdb8] bg-white px-5 py-3 text-center text-sm font-bold text-slate-800 transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700 hover:shadow-sm"
          >
            {t('common.register')}
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <div className="overflow-hidden rounded-[36px] border border-[#e2d6c3] bg-white shadow-sm">
        <div className="grid lg:grid-cols-[1fr_0.8fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">
              {t('profile.profileBadge', {
                defaultValue: 'Личный кабинет',
              })}
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              {t('profile.title', {
                defaultValue: 'Профиль',
              })}
            </h1>

            <p className="mt-5 max-w-2xl leading-8 text-slate-600">
              {t('profile.loggedInAs', {
                defaultValue: 'Вы вошли как',
              })}{' '}
              <span className="font-bold text-slate-950">{user.email}</span>.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                to="/create-property"
                className="rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20"
              >
                {t('profile.createProperty', {
                  defaultValue: 'Создать объявление',
                })}
              </Link>

              <Link
                to="/catalog"
                className="rounded-2xl border border-[#d9cdb8] bg-white px-5 py-3 text-center text-sm font-bold text-slate-800 transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700 hover:shadow-sm"
              >
                {t('profile.goToCatalog', {
                  defaultValue: 'Открыть каталог',
                })}
              </Link>
            </div>
          </div>

          <div className="hidden bg-gradient-to-br from-blue-600 via-blue-700 to-slate-950 p-8 text-white lg:block">
            <div className="grid h-full gap-4">
              <div className="rounded-[30px] border border-white/20 bg-white/15 p-6 backdrop-blur">
                <p className="text-sm text-blue-100">
                  {t('profile.myListingsStat', {
                    defaultValue: 'Мои объявления',
                  })}
                </p>

                <p className="mt-2 text-5xl font-bold">
                  {myProperties.length}
                </p>
              </div>

              <div className="rounded-[30px] border border-white/20 bg-white/15 p-6 backdrop-blur">
                <p className="text-sm text-blue-100">
                  {t('profile.profileSections', {
                    defaultValue: 'Разделы профиля',
                  })}
                </p>

                <p className="mt-2 text-xl font-bold">
                  {t('profile.profileSectionsText', {
                    defaultValue: 'диалоги, объявления, аккаунт',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <InboxMessages />

      {editForm && (
        <div className="overflow-hidden rounded-[32px] border border-[#e2d6c3] bg-white shadow-sm">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-5 py-5 text-white sm:px-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">
              {t('profile.editBadge', {
                defaultValue: 'Редактирование',
              })}
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {t('profile.editTitle', {
                defaultValue: 'Редактировать объявление',
              })}
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/75">
              {t('profile.editSubtitle', {
                defaultValue:
                  'После сохранения объявление снова отправится на модерацию.',
              })}
            </p>
          </div>

          <div className="p-5 sm:p-6">
            {updatePropertyMutation.isError && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {t('profile.updateError', {
                  defaultValue: 'Не удалось обновить объявление.',
                })}
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              <EditField
                label={t('profile.dealType', {
                  defaultValue: 'Тип сделки',
                })}
              >
                <div className="flex flex-wrap gap-2">
                  <EditPill
                    isActive={editForm.type === 'sale'}
                    onClick={() =>
                      setEditForm({
                        ...editForm,
                        type: 'sale',
                      })
                    }
                  >
                    {t('property.sale')}
                  </EditPill>

                  <EditPill
                    isActive={editForm.type === 'rent'}
                    onClick={() =>
                      setEditForm({
                        ...editForm,
                        type: 'rent',
                      })
                    }
                  >
                    {t('property.rent')}
                  </EditPill>
                </div>
              </EditField>

              <EditField
                label={t('profile.roomsLabel', {
                  defaultValue: 'Комнаты',
                })}
              >
                <div className="flex flex-wrap gap-2">
                  {[0, 1, 2, 3, 4, 5].map((room) => (
                    <EditPill
                      key={room}
                      isActive={editForm.rooms === room}
                      onClick={() =>
                        setEditForm({
                          ...editForm,
                          rooms: room,
                        })
                      }
                    >
                      {room === 0
                        ? t('catalog.studio')
                        : room === 5
                          ? '5+'
                          : room}
                    </EditPill>
                  ))}
                </div>
              </EditField>

              <div className="md:col-span-2">
                <EditInput
                  label={t('profile.titleLabel', {
                    defaultValue: 'Заголовок',
                  })}
                  value={editForm.title}
                  onChange={(value) =>
                    setEditForm({
                      ...editForm,
                      title: value,
                    })
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-800">
                  {t('profile.descriptionLabel', {
                    defaultValue: 'Описание',
                  })}
                </label>

                <textarea
                  value={editForm.description}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      description: event.target.value,
                    })
                  }
                  rows={5}
                  className="mt-2 w-full resize-none rounded-[24px] border border-[#d9cdb8] bg-[#fbfaf7] px-5 py-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <EditInput
                label={t('profile.priceLabel', {
                  defaultValue: 'Цена',
                })}
                type="number"
                value={String(editForm.price)}
                onChange={(value) =>
                  setEditForm({
                    ...editForm,
                    price: Number(value),
                  })
                }
              />

              <EditInput
                label={t('profile.addressLabel', {
                  defaultValue: 'Адрес',
                })}
                value={editForm.address}
                onChange={(value) =>
                  setEditForm({
                    ...editForm,
                    address: value,
                  })
                }
              />

              <EditInput
                label={t('profile.areaLabel', {
                  defaultValue: 'Площадь',
                })}
                type="number"
                value={String(editForm.area)}
                onChange={(value) =>
                  setEditForm({
                    ...editForm,
                    area: Number(value),
                  })
                }
              />

              <div className="md:col-span-2 rounded-[28px] border border-[#e2d6c3] bg-[#fbfaf7] p-5">
                <h3 className="text-lg font-bold text-slate-950">
                  {t('profile.infrastructureTitle', {
                    defaultValue: 'Инфраструктура рядом',
                  })}
                </h3>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <CheckboxPill
                    checked={editForm.hasMetro}
                    onChange={(checked) =>
                      setEditForm({ ...editForm, hasMetro: checked })
                    }
                  >
                    {t('profile.metroNearby', {
                      defaultValue: 'Метро / остановка рядом',
                    })}
                  </CheckboxPill>

                  <CheckboxPill
                    checked={editForm.hasSchool}
                    onChange={(checked) =>
                      setEditForm({ ...editForm, hasSchool: checked })
                    }
                  >
                    {t('property.school')}
                  </CheckboxPill>

                  <CheckboxPill
                    checked={editForm.hasKindergarten}
                    onChange={(checked) =>
                      setEditForm({ ...editForm, hasKindergarten: checked })
                    }
                  >
                    {t('property.kindergarten')}
                  </CheckboxPill>

                  <CheckboxPill
                    checked={editForm.hasPark}
                    onChange={(checked) =>
                      setEditForm({ ...editForm, hasPark: checked })
                    }
                  >
                    {t('property.park')}
                  </CheckboxPill>

                  <CheckboxPill
                    checked={editForm.hasShops}
                    onChange={(checked) =>
                      setEditForm({ ...editForm, hasShops: checked })
                    }
                  >
                    {t('property.shops')}
                  </CheckboxPill>

                  <CheckboxPill
                    checked={editForm.hasHospital}
                    onChange={(checked) =>
                      setEditForm({ ...editForm, hasHospital: checked })
                    }
                  >
                    {t('profile.hospitalNearby', {
                      defaultValue: 'Больница / поликлиника',
                    })}
                  </CheckboxPill>
                </div>
              </div>

              <div className="md:col-span-2 rounded-[28px] border border-amber-100 bg-amber-50 p-5">
                <h3 className="text-lg font-bold text-slate-950">
                  {t('profile.investmentTitle', {
                    defaultValue: 'Инвестиционная информация',
                  })}
                </h3>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <EditInput
                    label={t('profile.minInvestmentLabel', {
                      defaultValue: 'Минимальная инвестиция, ₽',
                    })}
                    type="number"
                    value={editForm.minInvestment?.toString() ?? ''}
                    onChange={(value) =>
                      setEditForm({
                        ...editForm,
                        minInvestment: getOptionalNumber(value),
                      })
                    }
                  />

                  <EditInput
                    label={t('profile.rentalYieldLabel', {
                      defaultValue: 'Доходность, % годовых',
                    })}
                    type="number"
                    value={editForm.rentalYield?.toString() ?? ''}
                    onChange={(value) =>
                      setEditForm({
                        ...editForm,
                        rentalYield: getOptionalNumber(value),
                      })
                    }
                  />

                  <EditInput
                    label={t('profile.paybackYearsLabel', {
                      defaultValue: 'Окупаемость, лет',
                    })}
                    type="number"
                    value={editForm.paybackYears?.toString() ?? ''}
                    onChange={(value) =>
                      setEditForm({
                        ...editForm,
                        paybackYears: getOptionalNumber(value),
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={updatePropertyMutation.isPending}
                className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {updatePropertyMutation.isPending
                  ? t('profile.saving', {
                      defaultValue: 'Сохраняем...',
                    })
                  : t('profile.saveChanges', {
                      defaultValue: 'Сохранить изменения',
                    })}
              </button>

              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-2xl border border-[#d9cdb8] bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700 hover:shadow-sm"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-[32px] border border-[#e2d6c3] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">
              {t('profile.propertiesBadge', {
                defaultValue: 'Объявления',
              })}
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-950">
              {t('profile.myProperties', {
                defaultValue: 'Мои объявления',
              })}
            </h2>

            <p className="mt-2 max-w-2xl text-slate-600">
              {t('profile.managePropertiesText', {
                defaultValue:
                  'Здесь отображаются объявления, которые вы создали на платформе.',
              })}
            </p>
          </div>

          <p className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
            {t('profile.total', {
              defaultValue: 'Всего',
            })}
            : {myProperties.length}
          </p>
        </div>

        {isLoading && (
          <div className="mt-6 rounded-2xl border border-[#e2d6c3] bg-[#fbfaf7] p-5 text-sm text-slate-600">
            {t('profile.loadingProperties', {
              defaultValue: 'Загружаем объявления...',
            })}
          </div>
        )}

        {isError && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
            {t('profile.loadError', {
              defaultValue: 'Не удалось загрузить объявления.',
            })}
          </div>
        )}

        {!isLoading && !isError && myProperties.length === 0 && (
          <div className="mt-6 rounded-[28px] border border-[#e2d6c3] bg-[#fbfaf7] p-6">
            <h3 className="text-xl font-bold text-slate-950">
              {t('profile.emptyTitle', {
                defaultValue: 'Объявлений пока нет',
              })}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {t('profile.emptyText', {
                defaultValue:
                  'Создайте первое объявление, чтобы оно появилось в личном кабинете.',
              })}
            </p>

            <Link
              to="/create-property"
              className="mt-5 inline-flex rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20"
            >
              {t('profile.createProperty', {
                defaultValue: 'Создать объявление',
              })}
            </Link>
          </div>
        )}

        {!isLoading && !isError && myProperties.length > 0 && (
          <div className="mt-6 grid gap-5 xl:grid-cols-2">
            {myProperties.map((property) => (
              <article
                key={property.id}
                className="overflow-hidden rounded-[30px] border border-[#e2d6c3] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10"
              >
                <div className="grid gap-0 md:grid-cols-[240px_1fr]">
                  <PropertyPhotoGallery
                    property={property}
                    selectPhotoLabel={t('profile.selectPhoto', {
                      defaultValue: 'Выбрать фото',
                    })}
                  />

                  <div className="min-w-0 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-2xl font-bold text-slate-950">
                          {formatPrice(
                            property.price,
                            property.type,
                            locale,
                            t('property.perMonth'),
                          )}
                        </p>

                        <p className="mt-1 text-sm font-bold text-blue-600">
                          {property.type === 'sale'
                            ? t('property.sale')
                            : t('property.rent')}
                        </p>
                      </div>

                      <span
                        className={[
                          'rounded-full px-3 py-1 text-xs font-bold',
                          getStatusClass(property.status),
                        ].join(' ')}
                      >
                        {statusLabels[property.status]}
                      </span>
                    </div>

                    <h3 className="mt-4 break-words text-lg font-bold text-slate-950 [overflow-wrap:anywhere]">
                      {property.title}
                    </h3>

                    <ExpandableDescription
                      text={property.description}
                      showFullLabel={t('profile.showFull', {
                        defaultValue: 'Показать полностью',
                      })}
                      hideFullLabel={t('profile.hideFull', {
                        defaultValue: 'Свернуть',
                      })}
                    />

                    <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold text-slate-700">
                      <span className="rounded-full bg-[#f7f2e8] px-3 py-1">
                        {property.area} м²
                      </span>

                      <span className="rounded-full bg-[#f7f2e8] px-3 py-1">
                        {property.rooms === 0
                          ? t('catalog.studio')
                          : `${property.rooms} ${t(
                              'property.rooms',
                            ).toLowerCase()}`}
                      </span>
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                      {property.address}
                    </p>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(property)}
                        className="rounded-2xl border border-[#d9cdb8] bg-white px-4 py-2 text-sm font-bold text-slate-800 transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700 hover:shadow-sm"
                      >
                        {t('common.edit', {
                          defaultValue: 'Редактировать',
                        })}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteProperty(property.id)}
                        disabled={deletingPropertyId === property.id}
                        className="rounded-2xl border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-600 transition hover:-translate-y-0.5 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingPropertyId === property.id
                          ? t('profile.deleting', {
                              defaultValue: 'Удаляем...',
                            })
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

      <DeleteAccountSection userEmail={user.email} />
    </section>
  )
}

type EditFieldProps = {
  label: string
  children: ReactNode
}

function EditField({ label, children }: EditFieldProps) {
  return (
    <div>
      <p className="block text-sm font-semibold text-slate-800">{label}</p>
      <div className="mt-2">{children}</div>
    </div>
  )
}

type EditPillProps = {
  isActive: boolean
  onClick: () => void
  children: ReactNode
}

function EditPill({ isActive, onClick, children }: EditPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-full px-4 py-2 text-sm font-bold transition',
        isActive
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
          : 'bg-[#f7f2e8] text-slate-700 hover:bg-white hover:text-blue-700 hover:shadow-sm',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

type EditInputProps = {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}

function EditInput({ label, value, onChange, type = 'text' }: EditInputProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-800">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-[24px] border border-[#d9cdb8] bg-[#fbfaf7] px-5 py-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
      />
    </div>
  )
}

type CheckboxPillProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  children: ReactNode
}

function CheckboxPill({ checked, onChange, children }: CheckboxPillProps) {
  return (
    <label className="cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />

      <span className="flex min-h-16 items-center rounded-2xl border border-[#e2d6c3] bg-white p-4 text-sm font-bold text-slate-700 transition peer-checked:border-emerald-300 peer-checked:bg-emerald-50 peer-checked:text-emerald-700 hover:-translate-y-0.5 hover:shadow-sm">
        {children}
      </span>
    </label>
  )
}