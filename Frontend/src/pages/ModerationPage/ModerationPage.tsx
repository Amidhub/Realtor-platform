// Модераторский кабинет.
// Показывает объявления на модерации, позволяет одобрять или отклонять их с причиной,
// а также показывает историю действий модераторов.

import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../app/AuthContext'
import {
  approveProperty,
  getModerationLogs,
  getModerationProperties,
  rejectProperty,
} from '../../api/propertiesApi'
import type { Property } from '../../types/property'

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

const fallbackPhoto =
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'

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
  const photos = property.photos.filter(isDisplayablePhoto)

  return photos.length > 0 ? photos : [fallbackPhoto]
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
        className="h-64 w-full object-cover transition duration-500"
      />

      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/60 to-transparent" />

      <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-slate-800 shadow-sm">
        ID {property.id}
      </div>

      {photos.length > 1 && (
        <div className="absolute bottom-3 left-3 right-3 grid grid-cols-3 gap-2">
          {photos.slice(0, 3).map((photo) => (
            <button
              key={photo}
              type="button"
              onClick={() => setSelectedPhoto(photo)}
              className={[
                'h-14 overflow-hidden rounded-2xl border transition',
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
  const shouldShowToggle = text.length > 140

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

type StatCardProps = {
  title: string
  value: string | number
  text: string
  variant?: 'blue' | 'green' | 'rose' | 'amber'
}

function StatCard({ title, value, text, variant = 'blue' }: StatCardProps) {
  const variantClassNames = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-emerald-50 text-emerald-700',
    rose: 'bg-rose-50 text-rose-700',
    amber: 'bg-amber-50 text-amber-700',
  }

  return (
    <div className="rounded-[28px] border border-[#e2d6c3] bg-white p-5 shadow-sm">
      <div
        className={[
          'inline-flex rounded-full px-3 py-1 text-xs font-bold',
          variantClassNames[variant],
        ].join(' ')}
      >
        {title}
      </div>

      <p className="mt-4 text-4xl font-bold text-slate-950">{value}</p>

      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  )
}

type InfoPillProps = {
  children: ReactNode
}

function InfoPill({ children }: InfoPillProps) {
  return (
    <span className="rounded-full bg-[#f7f2e8] px-3 py-1 text-sm font-semibold text-slate-700">
      {children}
    </span>
  )
}

export function ModerationPage() {
  const queryClient = useQueryClient()
  const { user, isAuthenticated } = useAuth()
  const { t, i18n } = useTranslation()

  const locale = i18n.language === 'en' ? 'en-US' : 'ru-RU'
  const isModerator = isAuthenticated && user?.role === 'moderator'

  const [rejectingPropertyId, setRejectingPropertyId] = useState<number | null>(
    null,
  )
  const [rejectReason, setRejectReason] = useState('')

  const {
    data: moderationProperties = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['moderation-properties'],
    queryFn: getModerationProperties,
    enabled: isModerator,
  })

  const {
    data: moderationLogs = [],
    isLoading: isLogsLoading,
    isError: isLogsError,
  } = useQuery({
    queryKey: ['moderation-logs'],
    queryFn: getModerationLogs,
    enabled: isModerator,
  })

  const refreshModerationData = () => {
    queryClient.invalidateQueries({ queryKey: ['moderation-properties'] })
    queryClient.invalidateQueries({ queryKey: ['moderation-logs'] })
    queryClient.invalidateQueries({ queryKey: ['catalog-properties'] })
    queryClient.invalidateQueries({ queryKey: ['my-properties'] })
    queryClient.invalidateQueries({ queryKey: ['property'] })
  }

  const approvePropertyMutation = useMutation({
    mutationFn: approveProperty,
    onSuccess: () => {
      refreshModerationData()
      setRejectingPropertyId(null)
      setRejectReason('')
    },
    onError: () => {
      alert(
        t('moderationPage.approveError', {
          defaultValue: 'Не удалось одобрить объявление. Попробуйте ещё раз.',
        }),
      )
    },
  })

  const rejectPropertyMutation = useMutation({
    mutationFn: ({
      propertyId,
      reason,
    }: {
      propertyId: number
      reason: string
    }) => rejectProperty(propertyId, reason),
    onSuccess: () => {
      refreshModerationData()
      setRejectingPropertyId(null)
      setRejectReason('')
    },
    onError: () => {
      alert(
        t('moderationPage.rejectAlertError', {
          defaultValue: 'Не удалось отклонить объявление. Попробуйте ещё раз.',
        }),
      )
    },
  })

  const handleApprove = (propertyId: number) => {
    approvePropertyMutation.mutate(propertyId)
  }

  const handleStartReject = (propertyId: number) => {
    setRejectingPropertyId(propertyId)
    setRejectReason('')
  }

  const handleCancelReject = () => {
    setRejectingPropertyId(null)
    setRejectReason('')
  }

  const handleConfirmReject = () => {
    if (!rejectingPropertyId || !rejectReason.trim()) {
      return
    }

    rejectPropertyMutation.mutate({
      propertyId: rejectingPropertyId,
      reason: rejectReason.trim(),
    })
  }

  const isActionPending =
    approvePropertyMutation.isPending || rejectPropertyMutation.isPending

  if (!isModerator) {
    return (
      <section className="mx-auto max-w-xl rounded-[34px] border border-[#e2d6c3] bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">
          {t('moderationPage.accessLimited')}
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-950">
          {t('moderationPage.noAccessTitle')}
        </h1>

        <p className="mt-3 leading-7 text-slate-600">
          {t('moderationPage.noAccessText')}
        </p>

        <Link
          to="/profile"
          className="mt-6 inline-flex rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20"
        >
          {t('moderationPage.backToProfile')}
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <div className="overflow-hidden rounded-[36px] border border-[#e2d6c3] bg-white shadow-sm">
        <div className="grid lg:grid-cols-[1fr_0.8fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">
              {t('moderationPage.badge')}
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              {t('moderationPage.title')}
            </h1>

            <p className="mt-5 max-w-2xl leading-8 text-slate-600">
              {t('moderationPage.subtitle')}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
                {t('moderationPage.reviewPill', {
                  defaultValue: 'Проверка объявлений',
                })}
              </span>

              <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
                {t('moderationPage.approval')}
              </span>

              <span className="rounded-full bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700">
                {t('moderationPage.rejectionWithReason', {
                  defaultValue: 'Отклонение с причиной',
                })}
              </span>
            </div>
          </div>

          <div className="hidden bg-gradient-to-br from-blue-600 via-blue-700 to-slate-950 p-8 text-white lg:block">
            <div className="grid h-full gap-4">
              <div className="rounded-[30px] border border-white/20 bg-white/15 p-6 backdrop-blur">
                <p className="text-sm text-blue-100">
                  {t('moderationPage.onReview')}
                </p>

                <p className="mt-2 text-5xl font-bold">
                  {moderationProperties.length}
                </p>
              </div>

              <div className="rounded-[30px] border border-white/20 bg-white/15 p-6 backdrop-blur">
                <p className="text-sm text-blue-100">
                  {t('moderationPage.actionsHistory', {
                    defaultValue: 'История действий',
                  })}
                </p>

                <p className="mt-2 text-4xl font-bold">
                  {moderationLogs.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title={t('moderationPage.onReview')}
          value={moderationProperties.length}
          text={t('moderationPage.onReviewText', {
            defaultValue: 'Объявления, которые ожидают решения модератора.',
          })}
          variant="blue"
        />

        <StatCard
          title={t('moderationPage.approval')}
          value="OK"
          text={t('moderationPage.approvalText')}
          variant="green"
        />

        <StatCard
          title={t('moderationPage.rejection')}
          value="!"
          text={t('moderationPage.rejectionText')}
          variant="rose"
        />
      </div>

      <div className="rounded-[32px] border border-[#e2d6c3] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">
              {t('moderationPage.queueBadge')}
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-950">
              {t('moderationPage.queueTitle')}
            </h2>

            <p className="mt-2 max-w-2xl leading-7 text-slate-600">
              {t('moderationPage.queueSubtitle')}
            </p>
          </div>

          <p className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
            {t('moderationPage.total')}: {moderationProperties.length}
          </p>
        </div>

        {isLoading && (
          <div className="mt-6 rounded-[24px] border border-[#e2d6c3] bg-[#fbfaf7] p-5 text-sm text-slate-600">
            {t('moderationPage.loading')}
          </div>
        )}

        {isError && (
          <div className="mt-6 rounded-[24px] border border-rose-200 bg-rose-50 p-5 text-sm font-semibold text-rose-700">
            {t('moderationPage.loadError')}
          </div>
        )}

        {!isLoading && !isError && moderationProperties.length === 0 && (
          <div className="mt-6 rounded-[28px] border border-[#e2d6c3] bg-[#fbfaf7] p-6">
            <h3 className="text-xl font-bold text-slate-950">
              {t('moderationPage.emptyTitle')}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {t('moderationPage.emptyText')}
            </p>
          </div>
        )}

        {!isLoading && !isError && moderationProperties.length > 0 && (
          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            {moderationProperties.map((property) => (
              <article
                key={property.id}
                className="overflow-hidden rounded-[30px] border border-[#e2d6c3] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10"
              >
                <PropertyPhotoGallery
                  property={property}
                  selectPhotoLabel={t('moderationPage.selectPhoto')}
                />

                <div className="p-5">
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

                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                      {t('moderationPage.statusModeration')}
                    </span>
                  </div>

                  <h3 className="mt-4 break-words text-xl font-bold text-slate-950 [overflow-wrap:anywhere]">
                    {property.title}
                  </h3>

                  <ExpandableDescription
                    text={property.description}
                    showFullLabel={t('moderationPage.showFull')}
                    hideFullLabel={t('moderationPage.hideFull')}
                  />

                  <div className="mt-5 flex flex-wrap gap-2">
                    <InfoPill>{property.area} м²</InfoPill>

                    <InfoPill>
                      {property.rooms === 0
                        ? t('catalog.studio')
                        : `${property.rooms} ${t(
                            'property.rooms',
                          ).toLowerCase()}`}
                    </InfoPill>

                    <InfoPill>{property.address}</InfoPill>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleApprove(property.id)}
                      disabled={isActionPending}
                      className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/20 disabled:cursor-not-allowed disabled:bg-emerald-300 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    >
                      {approvePropertyMutation.isPending
                        ? t('moderationPage.approving')
                        : t('moderationPage.approve')}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStartReject(property.id)}
                      disabled={isActionPending}
                      className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-bold text-rose-700 transition hover:-translate-y-0.5 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                    >
                      {t('moderationPage.reject')}
                    </button>
                  </div>

                  {rejectingPropertyId === property.id && (
                    <div className="mt-5 rounded-[26px] border border-rose-100 bg-rose-50/70 p-5">
                      <label className="block text-sm font-bold text-rose-800">
                        {t('moderationPage.rejectReasonLabel')}
                      </label>

                      <textarea
                        value={rejectReason}
                        onChange={(event) =>
                          setRejectReason(event.target.value)
                        }
                        rows={3}
                        placeholder={t(
                          'moderationPage.rejectReasonPlaceholder',
                        )}
                        className="mt-2 w-full resize-none rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                      />

                      {rejectPropertyMutation.isError && (
                        <p className="mt-2 text-sm font-semibold text-rose-700">
                          {t('moderationPage.rejectError')}
                        </p>
                      )}

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                        <button
                          type="button"
                          onClick={handleConfirmReject}
                          disabled={
                            rejectPropertyMutation.isPending ||
                            !rejectReason.trim()
                          }
                          className="rounded-2xl bg-rose-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:bg-rose-300"
                        >
                          {rejectPropertyMutation.isPending
                            ? t('moderationPage.rejecting')
                            : t('moderationPage.confirmReject')}
                        </button>

                        <button
                          type="button"
                          onClick={handleCancelReject}
                          className="rounded-2xl border border-rose-200 bg-white px-5 py-3 text-sm font-bold text-rose-700 transition hover:bg-rose-50"
                        >
                          {t('common.cancel')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-[32px] border border-[#e2d6c3] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">
              {t('moderationPage.logsBadge')}
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-950">
              {t('moderationPage.logsTitle')}
            </h2>

            <p className="mt-2 max-w-2xl leading-7 text-slate-600">
              {t('moderationPage.logsSubtitle')}
            </p>
          </div>

          <p className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
            {t('moderationPage.total')}: {moderationLogs.length}
          </p>
        </div>

        {isLogsLoading && (
          <div className="mt-6 rounded-[24px] border border-[#e2d6c3] bg-[#fbfaf7] p-5 text-sm text-slate-600">
            {t('moderationPage.logsLoading')}
          </div>
        )}

        {isLogsError && (
          <div className="mt-6 rounded-[24px] border border-rose-200 bg-rose-50 p-5 text-sm font-semibold text-rose-700">
            {t('moderationPage.logsError')}
          </div>
        )}

        {!isLogsLoading && !isLogsError && moderationLogs.length === 0 && (
          <div className="mt-6 rounded-[28px] border border-[#e2d6c3] bg-[#fbfaf7] p-6">
            <h3 className="text-xl font-bold text-slate-950">
              {t('moderationPage.logsEmptyTitle')}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {t('moderationPage.logsEmptyText')}
            </p>
          </div>
        )}

        {!isLogsLoading && !isLogsError && moderationLogs.length > 0 && (
          <div className="mt-6 space-y-3">
            {moderationLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-[24px] border border-[#e2d6c3] bg-[#fbfaf7] p-5 transition hover:bg-white hover:shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-bold text-slate-950">
                      {t('moderationPage.logListingId')}:{' '}
                      {log.listing_id ?? '—'}
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      {t('moderationPage.logAction')}:{' '}
                      {log.action ?? log.status ?? '—'}
                    </p>

                    {log.reason && (
                      <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-slate-700 [overflow-wrap:anywhere]">
                        {t('moderationPage.logReason')}: {log.reason}
                      </p>
                    )}
                  </div>

                  {log.created_at && (
                    <p className="w-fit rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-500 shadow-sm">
                      {new Date(log.created_at).toLocaleString(locale)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}