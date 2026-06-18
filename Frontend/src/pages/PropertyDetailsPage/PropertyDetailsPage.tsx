import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { getCurrentUser } from '../../api/authApi'
import { getPropertyById } from '../../api/propertiesApi'
import { ContactOwnerModal } from '../../components/ContactOwnerModal/ContactOwnerModal'
import { mockProperties } from '../../data/mockProperties'

const fallbackPhoto =
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'

function getPropertyOwnerId(property: unknown) {
  if (!property || typeof property !== 'object') {
    return null
  }

  const data = property as {
    userId?: unknown
    user_id?: unknown
    ownerId?: unknown
    owner_id?: unknown
  }

  const possibleOwnerId =
    data.userId ?? data.user_id ?? data.ownerId ?? data.owner_id

  if (typeof possibleOwnerId === 'number') {
    return possibleOwnerId
  }

  if (typeof possibleOwnerId === 'string') {
    const parsedOwnerId = Number(possibleOwnerId)

    if (Number.isFinite(parsedOwnerId)) {
      return parsedOwnerId
    }
  }

  return null
}

export function PropertyDetailsPage() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()

  const propertyId = Number(id)
  const isValidPropertyId = Number.isFinite(propertyId) && propertyId > 0

  const fallbackProperty = mockProperties.find(
    (item) => item.id === propertyId,
  )

  const propertyQuery = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => getPropertyById(propertyId),
    enabled: isValidPropertyId,
    retry: 1,
  })

  const currentUserQuery = useQuery({
    queryKey: ['current-user'],
    queryFn: getCurrentUser,
    retry: false,
  })

  const property = propertyQuery.data ?? fallbackProperty

  const photos =
    property && property.photos.length > 0 ? property.photos : [fallbackPhoto]

  const firstPhoto = photos[0] ?? fallbackPhoto

  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)

  const currentPhoto =
    selectedPhoto && photos.includes(selectedPhoto) ? selectedPhoto : firstPhoto

  if (isValidPropertyId && propertyQuery.isPending && !fallbackProperty) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-[30px] border border-[#e2d6c3] bg-white p-8 text-center shadow-sm">
          <p className="text-slate-600">{t('common.loading')}</p>
        </div>
      </main>
    )
  }

  if (!property) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-[30px] border border-[#e2d6c3] bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-950">
            {t('property.notFound')}
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {t('property.notFoundText')}
          </p>

          <Link
            to="/catalog"
            className="mt-5 inline-flex rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            ← {t('common.backToCatalog')}
          </Link>
        </div>
      </main>
    )
  }

  const locale = i18n.language === 'en' ? 'en-US' : 'ru-RU'

  const currentUserId = currentUserQuery.data?.id ?? null
  const propertyOwnerId = getPropertyOwnerId(property)

  const isOwnProperty =
    currentUserId !== null &&
    propertyOwnerId !== null &&
    currentUserId === propertyOwnerId

  const formattedPrice =
    property.type === 'rent'
      ? `${property.price.toLocaleString(locale)} ₽/${t('property.perMonth')}`
      : `${property.price.toLocaleString(locale)} ₽`

  const infrastructureItems = property.infrastructure
    ? [
        property.infrastructure.metro
          ? {
              title: t('property.transport'),
              value: property.infrastructure.metro,
            }
          : null,
        property.infrastructure.school
          ? {
              title: t('property.school'),
              value: property.infrastructure.school,
            }
          : null,
        property.infrastructure.kindergarten
          ? {
              title: t('property.kindergarten'),
              value: property.infrastructure.kindergarten,
            }
          : null,
        property.infrastructure.shop
          ? {
              title: t('property.shops'),
              value: property.infrastructure.shop,
            }
          : null,
        property.infrastructure.hospital
          ? {
              title: t('property.hospital'),
              value: property.infrastructure.hospital,
            }
          : null,
        property.infrastructure.park
          ? {
              title: t('property.park'),
              value: property.infrastructure.park,
            }
          : null,
      ].filter((item): item is InfoItemProps => item !== null)
    : []

  const investmentItems = property.investment
    ? [
        typeof property.investment.monthlyRent === 'number'
          ? {
              title: t('property.monthlyRent'),
              value: `${property.investment.monthlyRent.toLocaleString(
                locale,
              )} ₽/${t('property.perMonth')}`,
            }
          : null,
        typeof property.investment.minInvestment === 'number'
          ? {
              title: t('property.minInvestment', {
                defaultValue: 'Минимальная инвестиция',
              }),
              value: `${property.investment.minInvestment.toLocaleString(
                locale,
              )} ₽`,
            }
          : null,
        typeof property.investment.paybackYears === 'number'
          ? {
              title: t('property.payback', {
                defaultValue: 'Окупаемость',
              }),
              value: `${property.investment.paybackYears} ${t(
                'property.years',
                {
                  defaultValue: 'лет',
                },
              )}`,
            }
          : null,
        typeof property.investment.profitability === 'number'
          ? {
              title: t('property.profitability', {
                defaultValue: 'Доходность',
              }),
              value: `${property.investment.profitability}% ${t(
                'property.perYear',
                {
                  defaultValue: 'годовых',
                },
              )}`,
            }
          : null,
        property.investment.priceGrowth
          ? {
              title: t('property.potential'),
              value: property.investment.priceGrowth,
            }
          : null,
      ].filter((item): item is InfoItemProps => item !== null)
    : []

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Link
        to="/catalog"
        className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        ← {t('common.backToCatalog')}
      </Link>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
        <div className="rounded-[34px] border border-[#e2d6c3] bg-white p-4 shadow-sm">
          <div className="relative overflow-hidden rounded-[28px]">
            <img
              src={currentPhoto}
              alt={property.title}
              className="h-[300px] w-full object-cover sm:h-[470px]"
            />

            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/65 to-transparent" />

            <div className="absolute left-5 top-5 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-slate-800 shadow-sm backdrop-blur">
              {property.type === 'sale' ? t('property.sale') : t('property.rent')}
            </div>

            <div className="absolute bottom-5 left-5 right-5">
              <p className="text-sm font-semibold text-white/80">
                {property.address}
              </p>
            </div>
          </div>

          {photos.length > 1 && (
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
              {photos.map((photo) => (
                <button
                  key={photo}
                  type="button"
                  onClick={() => setSelectedPhoto(photo)}
                  className={[
                    'h-24 overflow-hidden rounded-2xl border transition sm:h-28',
                    currentPhoto === photo
                      ? 'border-blue-600 ring-4 ring-blue-100'
                      : 'border-transparent opacity-80 hover:border-slate-300 hover:opacity-100',
                  ].join(' ')}
                  aria-label={t('property.selectPhoto', {
                    defaultValue: 'Выбрать фото объекта',
                  })}
                >
                  <img
                    src={photo}
                    alt={property.title}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <aside className="h-fit rounded-[34px] border border-[#e2d6c3] bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            {property.type === 'sale' ? t('property.sale') : t('property.rent')}
          </p>

          <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
            {property.title}
          </h1>

          <p className="mt-5 text-4xl font-bold text-blue-600">
            {formattedPrice}
          </p>

          <p className="mt-4 leading-7 text-slate-600">{property.address}</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-3xl bg-[#f7f2e8] p-4">
              <p className="text-sm text-slate-500">{t('property.rooms')}</p>

              <p className="mt-1 text-2xl font-bold text-slate-950">
                {property.rooms === 0
                  ? t('catalog.studio')
                  : property.rooms}
              </p>
            </div>

            <div className="rounded-3xl bg-[#f7f2e8] p-4">
              <p className="text-sm text-slate-500">{t('property.area')}</p>

              <p className="mt-1 text-2xl font-bold text-slate-950">
                {property.area} м²
              </p>
            </div>
          </div>

          {isOwnProperty ? (
            <div className="mt-6 rounded-3xl border border-blue-100 bg-blue-50 p-5">
              <p className="font-bold text-blue-700">
                {t('property.ownListingTitle', {
                  defaultValue: 'Это ваше объявление',
                })}
              </p>

              <p className="mt-2 text-sm leading-6 text-blue-700">
                {t('property.ownListingText', {
                  defaultValue:
                    'Покупатели могут написать вам по этому объявлению. Ответить на сообщения можно здесь или в личном кабинете.',
                })}
              </p>

              <button
                type="button"
                onClick={() => setIsContactModalOpen(true)}
                className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20"
              >
                {t('property.openDialogs', {
                  defaultValue: 'Открыть диалоги',
                })}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsContactModalOpen(true)}
              className="mt-6 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-600/20"
            >
              {t('property.contactOwner')}
            </button>
          )}
        </aside>
      </section>

      <section className="mt-8 rounded-[34px] border border-[#e2d6c3] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <div className="h-2 w-14 rounded-full bg-blue-600" />

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            {t('property.description')}
          </p>
        </div>

        <h2 className="mt-5 text-3xl font-bold text-slate-950">
          {t('property.description')}
        </h2>

        <p className="mt-4 max-w-4xl leading-8 text-slate-700">
          {property.description}
        </p>
      </section>

      {infrastructureItems.length > 0 && (
        <section className="mt-8 rounded-[34px] border border-[#e2d6c3] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="h-2 w-14 rounded-full bg-emerald-600" />

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
              {t('property.infrastructure')}
            </p>
          </div>

          <h2 className="mt-5 text-3xl font-bold text-slate-950">
            {t('property.infrastructure')}
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {infrastructureItems.map((item) => (
              <InfoItem
                key={item.title}
                title={item.title}
                value={item.value}
                variant="green"
              />
            ))}
          </div>
        </section>
      )}

      {investmentItems.length > 0 && (
        <section className="mt-8 rounded-[34px] border border-[#e2d6c3] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="h-2 w-14 rounded-full bg-amber-500" />

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">
              {t('property.investment')}
            </p>
          </div>

          <h2 className="mt-5 text-3xl font-bold text-slate-950">
            {t('property.investment')}
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {investmentItems.map((item) => (
              <InfoItem
                key={item.title}
                title={item.title}
                value={item.value}
                variant="amber"
              />
            ))}
          </div>
        </section>
      )}

      <ContactOwnerModal
        isOpen={isContactModalOpen}
        propertyId={property.id}
        propertyTitle={property.title}
        isOwnerView={isOwnProperty}
        onClose={() => setIsContactModalOpen(false)}
      />
    </main>
  )
}

type InfoItemProps = {
  title: string
  value: string
  variant?: 'blue' | 'green' | 'amber'
}

function InfoItem({ title, value, variant = 'blue' }: InfoItemProps) {
  const variantClassNames = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
  }

  return (
    <div className="rounded-3xl border border-[#eee6d8] bg-[#fbfaf7] p-5">
      <p
        className={[
          'inline-flex rounded-full px-3 py-1 text-xs font-bold',
          variantClassNames[variant],
        ].join(' ')}
      >
        {title}
      </p>

      <p className="mt-4 text-lg font-bold text-slate-950">{value}</p>
    </div>
  )
}