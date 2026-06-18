import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const heroImage =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'

const catalogImage =
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80'

const createImage =
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80'

export function HomePage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[34px] border border-[#e2d6c3] bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="p-6 sm:p-10 lg:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">
              {t('home.badge')}
            </p>

            <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              {t('home.title')}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              {t('home.subtitle')}
            </p>

            <div className="mt-9 grid gap-4 sm:grid-cols-2">
              <Link
                to="/catalog"
                className="group rounded-[28px] border border-[#e2d6c3] bg-[#fbfaf7] p-5 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-xl hover:shadow-slate-900/10"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-600/20">
                    1
                  </div>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                    {t('home.catalogTag')}
                  </span>
                </div>

                <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-blue-600">
                  {t('home.findObject')}
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-950">
                  {t('home.openCatalogTitle')}
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {t('home.openCatalogText')}
                </p>

                <span className="mt-5 inline-flex rounded-2xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition group-hover:bg-blue-600">
                  {t('home.viewListingsButton')} →
                </span>
              </Link>

              <Link
                to="/create-property"
                className="group rounded-[28px] border border-[#e2d6c3] bg-[#fbfaf7] p-5 transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:bg-white hover:shadow-xl hover:shadow-slate-900/10"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-lg font-bold text-white shadow-lg shadow-emerald-600/20">
                    2
                  </div>

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    {t('home.listingTag')}
                  </span>
                </div>

                <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-emerald-600">
                  {t('home.publishObject')}
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-950">
                  {t('home.createListingTitle')}
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {t('home.createListingText')}
                </p>

                <span className="mt-5 inline-flex rounded-2xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition group-hover:bg-emerald-600">
                  {t('home.publishListingButton')} →
                </span>
              </Link>
            </div>
          </div>

          <div className="relative min-h-[380px] overflow-hidden bg-slate-100 lg:min-h-full">
            <img
              src={heroImage}
              alt="Modern apartment interior"
              className="h-full min-h-[380px] w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />

            <div className="absolute inset-x-5 bottom-5 rounded-3xl border border-white/60 bg-white/90 p-5 shadow-xl backdrop-blur">
              <p className="text-sm font-bold text-slate-950">
                {t('home.heroCardTitle')}
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {t('home.heroCardText')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard
          number="01"
          title={t('home.infoCatalogTitle')}
          text={t('home.infoCatalogText')}
        />

        <InfoCard
          number="02"
          title={t('home.infoModerationTitle')}
          text={t('home.infoModerationText')}
        />

        <InfoCard
          number="03"
          title={t('home.infoChatTitle')}
          text={t('home.infoChatText')}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[30px] border border-[#e2d6c3] bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">
            {t('home.quickStartBadge')}
          </p>

          <h2 className="mt-3 text-3xl font-bold text-slate-950">
            {t('home.quickStartTitle')}
          </h2>

          <p className="mt-3 leading-7 text-slate-600">
            {t('home.quickStartText')}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/catalog"
              className="inline-flex justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20"
            >
              {t('home.viewCatalogButton')}
            </Link>

            <Link
              to="/create-property"
              className="inline-flex justify-center rounded-2xl border border-[#d9cdb8] bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:text-emerald-700 hover:shadow-sm"
            >
              {t('home.addListingButton')}
            </Link>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl bg-[#f7f2e8] p-4">
              <p className="text-sm text-slate-500">{t('home.forBuyers')}</p>
              <p className="mt-1 font-bold text-slate-950">
                {t('home.forBuyersText')}
              </p>
            </div>

            <div className="rounded-3xl bg-[#f7f2e8] p-4">
              <p className="text-sm text-slate-500">{t('home.forOwners')}</p>
              <p className="mt-1 font-bold text-slate-950">
                {t('home.forOwnersText')}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="group relative h-72 overflow-hidden rounded-[30px] shadow-sm">
            <img
              src={catalogImage}
              alt="Apartment room"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />

            <div className="absolute bottom-5 left-5 right-5">
              <p className="text-sm font-semibold text-white">
                {t('home.catalogImageTitle')}
              </p>

              <p className="mt-1 text-sm leading-6 text-white/80">
                {t('home.catalogImageText')}
              </p>
            </div>
          </div>

          <div className="group relative h-72 overflow-hidden rounded-[30px] shadow-sm">
            <img
              src={createImage}
              alt="Apartment interior"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />

            <div className="absolute bottom-5 left-5 right-5">
              <p className="text-sm font-semibold text-white">
                {t('home.createImageTitle')}
              </p>

              <p className="mt-1 text-sm leading-6 text-white/80">
                {t('home.createImageText')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

type InfoCardProps = {
  number: string
  title: string
  text: string
}

function InfoCard({ number, title, text }: InfoCardProps) {
  return (
    <div className="group rounded-[30px] border border-[#e2d6c3] bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10">
      <div className="flex items-center justify-between gap-4">
        <div className="h-2 w-14 rounded-full bg-blue-600 transition group-hover:w-20" />

        <span className="rounded-full bg-[#f7f2e8] px-3 py-1 text-xs font-bold text-slate-500">
          {number}
        </span>
      </div>

      <h3 className="mt-6 text-xl font-bold text-slate-950">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  )
}