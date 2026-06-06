import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { mockProperties } from '../../data/mockProperties'

export function PropertyDetailsPage() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()

  const property = mockProperties.find((item) => item.id === Number(id))

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

  const mainPhoto = property.photos[0]
  const locale = i18n.language === 'en' ? 'en-US' : 'ru-RU'

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/catalog" className="text-sm text-blue-600 hover:underline">
        ← {t('common.backToCatalog')}
      </Link>

      <section className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <img
            src={mainPhoto}
            alt={property.title}
            className="h-[420px] w-full rounded-2xl object-cover"
          />

          <div className="mt-4 grid grid-cols-3 gap-3">
            {property.photos.slice(1).map((photo) => (
              <img
                key={photo}
                src={photo}
                alt={property.title}
                className="h-28 w-full rounded-xl object-cover"
              />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            {property.type === 'sale' ? t('property.sale') : t('property.rent')}
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            {property.title}
          </h1>

          <p className="mt-4 text-3xl font-bold text-blue-600">
            {property.price.toLocaleString(locale)} ₽
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

      {property.infrastructure && (
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">
            {t('property.infrastructure')}
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {property.infrastructure.metro && (
              <InfoItem
                title={t('property.transport')}
                value={property.infrastructure.metro}
              />
            )}

            {property.infrastructure.school && (
              <InfoItem
                title={t('property.school')}
                value={property.infrastructure.school}
              />
            )}

            {property.infrastructure.kindergarten && (
              <InfoItem
                title={t('property.kindergarten')}
                value={property.infrastructure.kindergarten}
              />
            )}

            {property.infrastructure.shop && (
              <InfoItem
                title={t('property.shops')}
                value={property.infrastructure.shop}
              />
            )}

            {property.infrastructure.hospital && (
              <InfoItem
                title={t('property.medicine')}
                value={property.infrastructure.hospital}
              />
            )}

            {property.infrastructure.park && (
              <InfoItem
                title={t('property.parks')}
                value={property.infrastructure.park}
              />
            )}
          </div>
        </section>
      )}

      {property.investment && (
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">
            {t('property.investment')}
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-4">
            {property.investment.monthlyRent && (
              <InfoItem
                title={t('property.averageRent')}
                value={`${property.investment.monthlyRent.toLocaleString(
                  locale,
                )} ₽/${t('property.perMonth')}`}
              />
            )}

            {property.investment.paybackYears && (
              <InfoItem
                title={t('property.payback')}
                value={`${property.investment.paybackYears} ${t(
                  'property.years',
                )}`}
              />
            )}

            {property.investment.profitability && (
              <InfoItem
                title={t('property.profitability')}
                value={`${property.investment.profitability}% ${t(
                  'property.perYear',
                )}`}
              />
            )}

            {property.investment.priceGrowth && (
              <InfoItem
                title={t('property.potential')}
                value={property.investment.priceGrowth}
              />
            )}
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