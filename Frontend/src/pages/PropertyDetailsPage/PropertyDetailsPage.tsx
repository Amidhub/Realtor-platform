import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { getPropertyById } from '../../api/propertiesApi'
import { mockProperties } from '../../data/mockProperties'

const fallbackPhoto =
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'

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

  const property = propertyQuery.data ?? fallbackProperty

  const photos =
  property && property.photos.length > 0 ? property.photos : [fallbackPhoto]

const firstPhoto = photos[0] ?? fallbackPhoto

const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

const currentPhoto =
  selectedPhoto && photos.includes(selectedPhoto) ? selectedPhoto : firstPhoto

  if (isValidPropertyId && propertyQuery.isPending && !fallbackProperty) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-slate-600">{t('common.loading')}</p>
      </main>
    )
  }

  if (!property) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-2xl font-bold text-slate-900">
          {t('property.notFound')}
        </h1>

        <Link
          to="/catalog"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          {t('common.backToCatalog')}
        </Link>
      </main>
    )
  }

  const locale = i18n.language === 'en' ? 'en-US' : 'ru-RU'

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
              title: t('property.medicine'),
              value: property.infrastructure.hospital,
            }
          : null,
        property.infrastructure.park
          ? {
              title: t('property.parks'),
              value: property.infrastructure.park,
            }
          : null,
      ].filter((item): item is InfoItemProps => item !== null)
    : []

  const investmentItems = property.investment
    ? [
        typeof property.investment.monthlyRent === 'number'
          ? {
              title: t('property.averageRent'),
              value: `${property.investment.monthlyRent.toLocaleString(
                locale,
              )} ₽/${t('property.perMonth')}`,
            }
          : null,
        typeof property.investment.minInvestment === 'number'
          ? {
              title: 'Минимальная инвестиция',
              value: `${property.investment.minInvestment.toLocaleString(
                locale,
              )} ₽`,
            }
          : null,
        typeof property.investment.paybackYears === 'number'
          ? {
              title: t('property.payback'),
              value: `${property.investment.paybackYears} ${t(
                'property.years',
              )}`,
            }
          : null,
        typeof property.investment.profitability === 'number'
          ? {
              title: t('property.profitability'),
              value: `${property.investment.profitability}% ${t(
                'property.perYear',
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
      <Link to="/catalog" className="text-sm text-blue-600 hover:underline">
        ← {t('common.backToCatalog')}
      </Link>

      <section className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <img
            src={currentPhoto}
            alt={property.title}
            className="h-[280px] w-full rounded-2xl object-cover sm:h-[420px]"
          />

          {photos.length > 1 && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {photos.map((photo) => (
                <button
                  key={photo}
                  type="button"
                  onClick={() => setSelectedPhoto(photo)}
                  className={[
                    'h-24 overflow-hidden rounded-xl border transition sm:h-28',
                    currentPhoto === photo
                      ? 'border-blue-600 ring-2 ring-blue-100'
                      : 'border-transparent hover:border-slate-300',
                  ].join(' ')}
                  aria-label="Выбрать фото объекта"
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

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            {property.type === 'sale' ? t('property.sale') : t('property.rent')}
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            {property.title}
          </h1>

          <p className="mt-4 text-3xl font-bold text-blue-600">
            {formattedPrice}
          </p>

          <p className="mt-4 text-slate-600">{property.address}</p>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">{t('property.rooms')}</p>
              <p className="text-xl font-semibold">{property.rooms}</p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">{t('property.area')}</p>
              <p className="text-xl font-semibold">{property.area} м²</p>
            </div>
          </div>

          <button className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">
            {t('property.contactOwner')}
          </button>
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">
          {t('property.description')}
        </h2>

        <p className="mt-4 leading-7 text-slate-700">{property.description}</p>
      </section>

      {infrastructureItems.length > 0 && (
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">
            {t('property.infrastructure')}
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {infrastructureItems.map((item) => (
              <InfoItem
                key={item.title}
                title={item.title}
                value={item.value}
              />
            ))}
          </div>
        </section>
      )}

      {investmentItems.length > 0 && (
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">
            {t('property.investment')}
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-4">
            {investmentItems.map((item) => (
              <InfoItem
                key={item.title}
                title={item.title}
                value={item.value}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

type InfoItemProps = {
  title: string
  value: string
}

function InfoItem({ title, value }: InfoItemProps) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  )
}