import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const COOKIE_CONSENT_KEY = 'realtor_platform_cookie_consent'

export function CookieConsentBanner() {
  const { t } = useTranslation()

  const [isVisible, setIsVisible] = useState(() => {
    return localStorage.getItem(COOKIE_CONSENT_KEY) === null
  })

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted')
    setIsVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined')
    setIsVisible(false)
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            {t('cookieConsent.title')}
          </h2>

          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            {t('cookieConsent.text')}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleDecline}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            {t('cookieConsent.decline')}
          </button>

          <button
            type="button"
            onClick={handleAccept}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            {t('cookieConsent.accept')}
          </button>
        </div>
      </div>
    </div>
  )
}