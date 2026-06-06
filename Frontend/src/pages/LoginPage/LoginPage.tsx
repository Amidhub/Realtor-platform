// Страница входа пользователя.
// Отправляет email/password на backend и показывает понятные ошибки авторизации.

import axios from 'axios'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../app/AuthContext'
import { loginSchema, type LoginFormValues } from './loginSchema'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [authError, setAuthError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    setAuthError('')

    try {
      await login(data)
      navigate('/profile')
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setAuthError(t('auth.loginError'))
        return
      }

      setAuthError(t('auth.loginError'))
    }
  }

  return (
    <section className="mx-auto max-w-md rounded-2xl bg-white p-4 shadow-sm sm:p-8">
      <h1 className="text-2xl font-bold text-slate-900">
        {t('auth.loginTitle')}
      </h1>

      <p className="mt-2 text-slate-600">{t('auth.loginSubtitle')}</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700"
          >
            {t('auth.email')}
          </label>

          <input
            id="email"
            type="email"
            placeholder={t('auth.emailPlaceholder')}
            {...register('email')}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
          />

          {errors.email && (
            <p className="mt-2 text-sm text-red-600">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-700"
          >
            {t('auth.password')}
          </label>

          <input
            id="password"
            type="password"
            placeholder={t('auth.passwordPlaceholder')}
            {...register('password')}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
          />

          {errors.password && (
            <p className="mt-2 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        {authError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">{authError}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isSubmitting ? t('common.loading') : t('auth.submitLogin')}
        </button>
      </form>
    </section>
  )
}