// Шапка сайта.
// Содержит логотип, основную навигацию, переключатель языка и блок авторизации пользователя.

import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../app/AuthContext'

export function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const { t, i18n } = useTranslation()
  const location = useLocation()

  const isModerator = isAuthenticated && user?.role === 'moderator'

  const commonNavLinks = [
    { to: '/', label: t('common.home') },
    { to: '/catalog', label: t('common.catalog') },
    { to: '/create-property', label: t('common.createProperty') },
    { to: '/profile', label: t('common.profile') },
  ]

  const moderatorNavLink = {
    to: '/moderation',
    label: t('common.moderation'),
  }

  const navLinks = isModerator
    ? [...commonNavLinks, moderatorNavLink]
    : commonNavLinks

  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'rounded-xl px-3 py-2 text-sm font-bold transition',
      isActive
        ? 'bg-blue-600 text-white shadow-sm'
        : 'text-slate-700 hover:bg-[#f7f2e8] hover:text-blue-700',
    ].join(' ')

  const getAuthLinkClass = (isActive: boolean) =>
    [
      'rounded-xl px-4 py-2 text-sm font-bold transition',
      isActive
        ? 'bg-blue-600 text-white shadow-sm'
        : 'text-slate-700 hover:bg-[#f7f2e8] hover:text-blue-700',
    ].join(' ')

  const changeLanguage = (language: 'ru' | 'en') => {
    i18n.changeLanguage(language)
  }

  const isRussian = i18n.language.startsWith('ru')
  const isEnglish = i18n.language.startsWith('en')

  return (
    <header className="sticky top-0 z-40 border-b border-[#e2d6c3] bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <NavLink
          to="/"
          className="shrink-0 text-xl font-black tracking-tight text-blue-600"
        >
          {t('common.appName')}
        </NavLink>

        <nav className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={getLinkClass}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex rounded-xl border border-[#d9cdb8] bg-[#fbfaf7] p-1">
            <button
              type="button"
              onClick={() => changeLanguage('ru')}
              className={[
                'rounded-lg px-2 py-1 text-xs font-bold transition',
                isRussian
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-white hover:text-blue-700',
              ].join(' ')}
            >
              RU
            </button>

            <button
              type="button"
              onClick={() => changeLanguage('en')}
              className={[
                'rounded-lg px-2 py-1 text-xs font-bold transition',
                isEnglish
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-white hover:text-blue-700',
              ].join(' ')}
            >
              EN
            </button>
          </div>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <span className="hidden max-w-[180px] truncate text-sm font-medium text-slate-600 lg:inline">
                {user.email}
              </span>

              <button
                type="button"
                onClick={logout}
                className="rounded-xl px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-[#f7f2e8] hover:text-blue-700"
              >
                {t('common.logout')}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink
                to="/login"
                className={getAuthLinkClass(location.pathname === '/login')}
              >
                {t('common.login')}
              </NavLink>

              <NavLink
                to="/register"
                className={getAuthLinkClass(
                  location.pathname === '/register',
                )}
              >
                {t('common.register')}
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}