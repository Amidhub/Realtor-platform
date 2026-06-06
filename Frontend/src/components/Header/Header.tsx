// Шапка сайта.
// Содержит логотип, основную навигацию, переключатель языка и блок авторизации пользователя.

import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../app/AuthContext'

export function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const { t, i18n } = useTranslation()

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
      'rounded-lg px-3 py-2 text-sm font-medium transition',
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-slate-700 hover:bg-slate-100 hover:text-blue-600',
    ].join(' ')

  const changeLanguage = (language: 'ru' | 'en') => {
    i18n.changeLanguage(language)
  }

  const currentLanguage = i18n.language

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <NavLink to="/" className="shrink-0 text-xl font-bold text-blue-600">
          {t('common.appName')}
        </NavLink>

        <nav className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={getLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => changeLanguage('ru')}
              className={[
                'rounded-md px-2 py-1 text-xs font-semibold transition',
                currentLanguage === 'ru'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-white',
              ].join(' ')}
            >
              RU
            </button>

            <button
              type="button"
              onClick={() => changeLanguage('en')}
              className={[
                'rounded-md px-2 py-1 text-xs font-semibold transition',
                currentLanguage === 'en'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-white',
              ].join(' ')}
            >
              EN
            </button>
          </div>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-slate-600 lg:inline">
                {user.email}
              </span>

              <button
                type="button"
                onClick={logout}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {t('common.logout')}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink
                to="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {t('common.login')}
              </NavLink>

              <NavLink
                to="/register"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
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