// Страница входа пользователя.
// Содержит форму авторизации и отправляет данные в AuthContext.

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../app/AuthContext'
import { loginSchema, type LoginFormValues } from './loginSchema'

function AuthEstatePreview() {
  const { t } = useTranslation()

  return (
    <div className="relative flex h-full min-h-[600px] flex-col overflow-hidden rounded-[34px] bg-gradient-to-br from-[#0f766e] via-blue-700 to-slate-950 p-8 text-white">
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-24 right-8 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />

      <div className="relative z-10">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-100">
          {t('loginPreview.badge')}
        </p>

        <h2 className="mt-4 max-w-lg text-4xl font-bold leading-tight">
          {t('loginPreview.title')}
        </h2>

        <p className="mt-4 max-w-lg text-sm leading-7 text-blue-50/90">
          {t('loginPreview.subtitle')}
        </p>
      </div>

      <div className="relative z-10 mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[24px] border border-white/15 bg-white/10 p-4 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.18em] text-blue-100">
            {t('loginPreview.objectsLabel')}
          </p>

          <p className="mt-2 text-lg font-semibold">
            {t('loginPreview.catalog')}
          </p>
        </div>

        <div className="rounded-[24px] border border-white/15 bg-white/10 p-4 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.18em] text-blue-100">
            {t('loginPreview.chatLabel')}
          </p>

          <p className="mt-2 text-lg font-semibold">
            {t('loginPreview.dialogs')}
          </p>
        </div>

        <div className="rounded-[24px] border border-white/15 bg-white/10 p-4 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.18em] text-blue-100">
            {t('loginPreview.accountLabel')}
          </p>

          <p className="mt-2 text-lg font-semibold">
            {t('loginPreview.profile')}
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-8 flex-1 rounded-[34px] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur">
        <div className="relative h-full min-h-[320px] overflow-hidden rounded-[28px] bg-[#e2f6d8]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(255,255,255,0.75),transparent_28%),radial-gradient(circle_at_80%_14%,rgba(255,255,255,0.45),transparent_24%)]" />

          <div className="absolute left-12 top-12 h-24 w-28 rounded-[28px] bg-emerald-500/25" />
          <div className="absolute bottom-12 right-12 h-28 w-32 rounded-[32px] bg-emerald-600/25" />

          <div className="absolute bottom-0 left-1/2 h-52 w-16 -translate-x-1/2 -rotate-6 rounded-t-full bg-[#c9a574]" />
          <div className="absolute bottom-20 left-1/2 h-24 w-40 -translate-x-1/2 rounded-[999px] bg-[#ead8b4]" />

          <div className="absolute left-1/2 top-28 w-72 -translate-x-1/2 rounded-[30px] border border-white/70 bg-white p-5 shadow-xl">
            <div className="relative h-36 rounded-[24px] bg-[#f7f2e8]">
              <div className="absolute left-1/2 top-8 h-24 w-44 -translate-x-1/2 rounded-[18px] bg-white shadow-sm" />
              <div className="absolute left-1/2 top-4 h-20 w-44 -translate-x-1/2 rotate-45 rounded-[10px] bg-blue-600" />
              <div className="absolute left-1/2 top-12 h-22 w-40 -translate-x-1/2 rounded-[18px] bg-white" />
              <div className="absolute bottom-0 left-1/2 h-14 w-10 -translate-x-1/2 rounded-t-xl bg-slate-800" />
              <div className="absolute bottom-10 left-16 h-8 w-8 rounded-lg bg-blue-100" />
              <div className="absolute bottom-10 right-16 h-8 w-8 rounded-lg bg-blue-100" />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-950">
                  {t('loginPreview.cardTitle')}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {t('loginPreview.cardSubtitle')}
                </p>
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                {t('loginPreview.cardStatus')}
              </span>
            </div>
          </div>

          <div className="absolute left-8 top-1/2 h-12 w-12 rounded-full bg-emerald-600 shadow-lg" />
          <div className="absolute left-12 top-[47%] h-14 w-4 rounded-full bg-[#7a4f2b]" />

          <div className="absolute right-10 top-14 h-14 w-14 rounded-full bg-emerald-600 shadow-lg" />
          <div className="absolute right-16 top-[90px] h-16 w-4 rounded-full bg-[#7a4f2b]" />

          <div className="absolute bottom-5 left-5 right-5 rounded-[24px] border border-white/70 bg-white/80 p-4 text-slate-900 shadow-lg backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
              {t('loginPreview.bottomBadge')}
            </p>

            <p className="mt-1 text-sm font-semibold">
              {t('loginPreview.bottomText')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()

  const [authError, setAuthError] = useState('')

  const translatedLoginSchema = useMemo(() => loginSchema(t), [t, i18n.language])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitted },
    trigger,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(translatedLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    if (isSubmitted) {
      void trigger()
    }
  }, [i18n.language, isSubmitted, trigger])

  const onSubmit = async (data: LoginFormValues) => {
    setAuthError('')

    try {
      await login({
        email: data.email,
        password: data.password,
      })
      navigate('/profile')
    } catch (error) {
      console.error(error)
      setAuthError(t('auth.loginError'))
    }
  }

  return (
    <section className="mx-auto max-w-6xl">
      <div className="overflow-hidden rounded-[36px] border border-[#e2d6c3] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="grid min-h-[680px] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex items-center p-6 sm:p-8 lg:p-10">
            <div className="w-full">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">
                {t('loginPreview.profileBadge')}
              </p>

              <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950">
                {t('auth.loginTitle')}
              </h1>

              <p className="mt-3 max-w-md leading-7 text-slate-600">
                {t('auth.loginSubtitle')}
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-slate-800"
                  >
                    {t('auth.email')}
                  </label>

                  <input
                    id="email"
                    type="email"
                    placeholder={t('auth.emailPlaceholder')}
                    {...register('email')}
                    className="mt-2 w-full rounded-[22px] border border-[#d9cdb8] bg-[#fcfaf6] px-5 py-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                  {errors.email && (
                    <p className="mt-2 text-sm font-medium text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-800"
                  >
                    {t('auth.password')}
                  </label>

                  <input
                    id="password"
                    type="password"
                    placeholder={t('auth.passwordPlaceholder')}
                    {...register('password')}
                    className="mt-2 w-full rounded-[22px] border border-[#d9cdb8] bg-[#fcfaf6] px-5 py-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                  {errors.password && (
                    <p className="mt-2 text-sm font-medium text-red-600">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {authError && (
                  <div className="rounded-[22px] border border-red-200 bg-red-50 p-4">
                    <p className="text-sm font-semibold text-red-700">
                      {authError}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl bg-blue-600 px-6 py-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 disabled:cursor-not-allowed disabled:bg-blue-300 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  {isSubmitting ? t('common.loading') : t('auth.submitLogin')}
                </button>
              </form>

              <div className="mt-6 rounded-[24px] border border-[#e2d6c3] bg-[#fcfaf6] p-4">
                <p className="text-sm leading-6 text-slate-600">
                  {t('auth.noAccount')}{' '}
                  <Link
                    to="/register"
                    className="font-bold text-blue-600 hover:text-blue-700"
                  >
                    {t('auth.registerLink')}
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <div className="hidden p-5 lg:block">
            <AuthEstatePreview />
          </div>

          <div className="border-t border-[#e2d6c3] bg-gradient-to-br from-[#0f766e] via-[#1454d8] to-[#081f5c] p-6 text-white lg:hidden">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-100">
              {t('loginPreview.badge')}
            </p>

            <p className="mt-2 text-sm leading-6 text-blue-50/90">
              {t('loginPreview.mobileText')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}