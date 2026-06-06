// Главная страница приложения.
// Содержит приветственный блок и базовую поисковую строку по недвижимости.

import { useTranslation } from 'react-i18next'

export function HomePage() {
  const { t } = useTranslation()

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-8">
      <p className="text-sm font-medium uppercase tracking-wide text-blue-600">
        {t('home.badge')}
      </p>

      <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        {t('home.title')}
      </h1>

      <p className="mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
        {t('home.subtitle')}
      </p>

      <div className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder={t('home.searchPlaceholder')}
          className="flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
        />

        <button className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700">
          {t('home.searchButton')}
        </button>
      </div>
    </section>
  )
}