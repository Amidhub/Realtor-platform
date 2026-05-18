// Заглушка личного кабинета пользователя.
// Показывает базовое меню и информацию о текущем пользователе.

import { Link } from 'react-router-dom'
import { useAuth } from '../../app/AuthContext'

export function ProfilePage() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return (
      <section className="mx-auto max-w-xl rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Личный кабинет</h1>

        <p className="mt-3 text-slate-600">
          Чтобы открыть личный кабинет, нужно войти в аккаунт.
        </p>

        <div className="mt-6 flex gap-3">
          <Link
            to="/login"
            className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
          >
            Войти
          </Link>

          <Link
            to="/register"
            className="rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
          >
            Зарегистрироваться
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-2xl bg-white p-8 shadow-sm">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-blue-600">
          Профиль пользователя
        </p>

        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          Личный кабинет
        </h1>

        <p className="mt-2 text-slate-600">
            Вы вошли как <span className="font-medium">{user.email}</span>.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 p-4">
          <h2 className="font-semibold">Мои объявления</h2>
          <p className="mt-2 text-sm text-slate-600">Заглушка раздела.</p>
        </div>

        <Link
          to="/create-property"
          className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50"
        >
          <h2 className="font-semibold">Создать объявление</h2>
          <p className="mt-2 text-sm text-slate-600">Переход к форме создания.</p>
        </Link>

        <div className="rounded-xl border border-slate-200 p-4">
          <h2 className="font-semibold">Настройки профиля</h2>
          <p className="mt-2 text-sm text-slate-600">Заглушка настроек.</p>
        </div>
      </div>
    </section>
  )
}