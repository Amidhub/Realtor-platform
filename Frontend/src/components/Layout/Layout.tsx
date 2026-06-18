import { Outlet } from 'react-router-dom'
import { CookieConsentBanner } from '../CookieConsentBanner/CookieConsentBanner'
import { Header } from '../Header/Header'

export function Layout() {
  return (
    <div className="min-h-screen bg-[#f6f1e8] text-slate-900">
      <Header />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <CookieConsentBanner />
    </div>
  )
}