// Шапка сайта.
// Содержит логотип, основную навигацию и блок авторизации пользователя.

import { NavLink } from 'react-router-dom'
import { useAuth } from '../../app/AuthContext'

const commonNavLinks = [
  { to: '/', label: 'Главная' },
  { to: '/catalog', label: 'Каталог' },
  { to: '/create-property', label: 'Создать объявление' },
  { to: '/profile', label: 'Личный кабинет' },
]

const moderatorNavLink = { to: '/moderation', label: 'Модерация' }

export function Header() {
  const { user, isAuthenticated, logout } = useAuth()

  const isModerator = isAuthenticated && user?.role === 'moderator'

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

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <NavLink to="/" className="text-xl font-bold text-blue-600">
          Realtor Platform
        </NavLink>

        <nav className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={getLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {isAuthenticated && user ? (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 sm:inline">
              {user.email}
            </span>

            <button
              type="button"
              onClick={logout}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Выйти
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <NavLink
              to="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Войти
            </NavLink>

            <NavLink
              to="/register"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Регистрация
            </NavLink>
          </div>
        )}
      </div>
    </header>
  )
}