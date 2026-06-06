// Модераторский кабинет.
// Показывает объявления на модерации, позволяет одобрять или отклонять их с причиной,
// а также показывает историю действий модераторов.

import { useState } from 'react'
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

  const approvePropertyMutation = useMutation({
    mutationFn: approveProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-properties'] })
      queryClient.invalidateQueries({ queryKey: ['moderation-logs'] })
      setRejectingPropertyId(null)
      setRejectReason('')
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
      queryClient.invalidateQueries({ queryKey: ['moderation-properties'] })
      queryClient.invalidateQueries({ queryKey: ['moderation-logs'] })
      setRejectingPropertyId(null)
      setRejectReason('')
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
      <section className="mx-auto max-w-xl rounded-2xl bg-white p-4 shadow-sm sm:p-8">
        <p className="text-sm font-medium uppercase tracking-wide text-blue-600">
          {t('moderationPage.accessLimited')}
        </p>

        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          {t('moderationPage.noAccessTitle')}
        </h1>

        <p className="mt-3 text-slate-600">
          {t('moderationPage.noAccessText')}
        </p>

        <Link
          to="/profile"
          className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
        >
          {t('moderationPage.backToProfile')}
        </Link>
      </section>
    )
  }

  return (
    <section className="space-y-8">
      <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-8">
        <p className="text-sm font-medium uppercase tracking-wide text-blue-600">
          {t('moderationPage.badge')}
        </p>

        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          {t('moderationPage.title')}
        </h1>

        <p className="mt-2 text-slate-600">{t('moderationPage.subtitle')}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">
              {t('moderationPage.onReview')}
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {moderationProperties.length}
            </p>
          </div>

          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm text-green-700">
              {t('moderationPage.approval')}
            </p>

            <p className="mt-1 text-sm font-medium text-green-800">
              {t('moderationPage.approvalText')}
            </p>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">
              {t('moderationPage.rejection')}
            </p>

            <p className="mt-1 text-sm font-medium text-red-800">
              {t('moderationPage.rejectionText')}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-blue-600">
              {t('moderationPage.queueBadge')}
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {t('moderationPage.queueTitle')}
            </h2>

            <p className="mt-2 text-slate-600">
              {t('moderationPage.queueSubtitle')}
            </p>
          </div>

          <p className="text-sm text-slate-500">
            {t('moderationPage.total')}: {moderationProperties.length}
          </p>
        </div>

        {isLoading && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            {t('moderationPage.loading')}
          </div>
        )}

        {isError && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {t('moderationPage.loadError')}
          </div>
        )}

        {!isLoading && !isError && moderationProperties.length === 0 && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="font-semibold text-slate-900">
              {t('moderationPage.emptyTitle')}
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              {t('moderationPage.emptyText')}
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
                  <PropertyPhotoGallery
                    property={property}
                    selectPhotoLabel={t('moderationPage.selectPhoto')}
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

                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                        {t('moderationPage.statusModeration')}
                      </span>
                    </div>

                    <h3 className="mt-4 break-words text-lg font-semibold text-slate-900 [overflow-wrap:anywhere]">
                      {property.title}
                    </h3>

                    <ExpandableDescription
                      text={property.description}
                      showFullLabel={t('moderationPage.showFull')}
                      hideFullLabel={t('moderationPage.hideFull')}
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
                        onClick={() => handleApprove(property.id)}
                        disabled={isActionPending}
                        className="rounded-xl border border-green-200 px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {approvePropertyMutation.isPending
                          ? t('moderationPage.approving')
                          : t('moderationPage.approve')}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartReject(property.id)}
                        disabled={isActionPending}
                        className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {t('moderationPage.reject')}
                      </button>
                    </div>

                    {rejectingPropertyId === property.id && (
                      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                        <label className="block text-sm font-medium text-red-800">
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
                          className="mt-2 w-full resize-none rounded-xl border border-red-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-400"
                        />

                        {rejectPropertyMutation.isError && (
                          <p className="mt-2 text-sm font-medium text-red-700">
                            {t('moderationPage.rejectError')}
                          </p>
                        )}

                        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                          <button
                            type="button"
                            onClick={handleConfirmReject}
                            disabled={
                              rejectPropertyMutation.isPending ||
                              !rejectReason.trim()
                            }
                            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                          >
                            {rejectPropertyMutation.isPending
                              ? t('moderationPage.rejecting')
                              : t('moderationPage.confirmReject')}
                          </button>

                          <button
                            type="button"
                            onClick={handleCancelReject}
                            className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                          >
                            {t('common.cancel')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-blue-600">
              {t('moderationPage.logsBadge')}
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {t('moderationPage.logsTitle')}
            </h2>

            <p className="mt-2 text-slate-600">
              {t('moderationPage.logsSubtitle')}
            </p>
          </div>

          <p className="text-sm text-slate-500">
            {t('moderationPage.total')}: {moderationLogs.length}
          </p>
        </div>

        {isLogsLoading && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            {t('moderationPage.logsLoading')}
          </div>
        )}

        {isLogsError && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {t('moderationPage.logsError')}
          </div>
        )}

        {!isLogsLoading && !isLogsError && moderationLogs.length === 0 && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="font-semibold text-slate-900">
              {t('moderationPage.logsEmptyTitle')}
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              {t('moderationPage.logsEmptyText')}
            </p>
          </div>
        )}

        {!isLogsLoading && !isLogsError && moderationLogs.length > 0 && (
          <div className="mt-6 space-y-3">
            {moderationLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium text-slate-900">
                      {t('moderationPage.logListingId')}:{' '}
                      {log.listing_id ?? '—'}
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      {t('moderationPage.logAction')}:{' '}
                      {log.action ?? log.status ?? '—'}
                    </p>

                    {log.reason && (
                      <p className="mt-2 whitespace-pre-line break-words text-sm text-slate-700 [overflow-wrap:anywhere]">
                        {t('moderationPage.logReason')}: {log.reason}
                      </p>
                    )}
                  </div>

                  {log.created_at && (
                    <p className="text-sm text-slate-500">
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