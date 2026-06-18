// Страница регистрации пользователя.
// Содержит форму создания аккаунта с базовой валидацией.
// Backend требует email, password и agreement.

import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../app/AuthContext'
import { registerSchema, type RegisterFormValues } from './registerSchema'

function AuthEstatePreview() {
  const { t } = useTranslation()

  return (
    <div className="relative flex h-full min-h-[600px] flex-col overflow-hidden rounded-[34px] bg-gradient-to-br from-[#0f9f8c] via-blue-700 to-slate-950 p-8 text-white">
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-24 right-8 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />

      <div className="relative z-10">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-100">
          {t('registerPreview.badge')}
        </p>

        <h2 className="mt-4 max-w-lg text-4xl font-bold leading-tight">
          {t('registerPreview.title')}
        </h2>

        <p className="mt-4 max-w-lg text-sm leading-7 text-emerald-50/95">
          {t('registerPreview.subtitle')}
        </p>
      </div>

      <div className="relative z-10 mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[24px] border border-white/15 bg-white/10 p-4 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-100">
            {t('registerPreview.searchLabel')}
          </p>

          <p className="mt-2 text-lg font-semibold">
            {t('registerPreview.catalog')}
          </p>
        </div>

        <div className="rounded-[24px] border border-white/15 bg-white/10 p-4 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-100">
            {t('registerPreview.publishLabel')}
          </p>

          <p className="mt-2 text-lg font-semibold">
            {t('registerPreview.listings')}
          </p>
        </div>

        <div className="rounded-[24px] border border-white/15 bg-white/10 p-4 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-100">
            {t('registerPreview.connectionLabel')}
          </p>

          <p className="mt-2 text-lg font-semibold">
            {t('registerPreview.messages')}
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-8 flex-1 rounded-[34px] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur">
        <div className="relative h-full min-h-[320px] overflow-hidden rounded-[28px] bg-[#e2f6d8]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(255,255,255,0.75),transparent_28%),radial-gradient(circle_at_80%_14%,rgba(255,255,255,0.45),transparent_24%)]" />

          <div className="absolute left-6 top-6 right-6 bottom-6 rounded-[34px] border-2 border-dashed border-emerald-700/25" />

          <div className="absolute left-12 top-12 h-24 w-28 rounded-[28px] bg-emerald-500/25" />
          <div className="absolute bottom-12 right-12 h-28 w-32 rounded-[32px] bg-emerald-600/25" />

          <div className="absolute bottom-0 left-1/2 h-52 w-16 -translate-x-1/2 -rotate-6 rounded-t-full bg-[#c9a574]" />
          <div className="absolute bottom-20 left-1/2 h-24 w-40 -translate-x-1/2 rounded-[999px] bg-[#ead8b4]" />

          <div className="absolute left-1/2 top-20 w-68 -translate-x-1/2 rounded-[30px] border border-white/70 bg-white p-4 shadow-xl">
            <div className="relative h-36 rounded-[24px] bg-[#f7f2e8]">
              <div className="absolute left-1/2 top-6 h-24 w-40 -translate-x-1/2 rounded-[18px] bg-white shadow-sm" />
              <div className="absolute left-1/2 top-1 h-20 w-44 -translate-x-1/2 rotate-45 rounded-[10px] bg-emerald-600" />
              <div className="absolute left-1/2 top-10 h-22 w-40 -translate-x-1/2 rounded-[18px] bg-white" />
              <div className="absolute bottom-0 left-1/2 h-14 w-10 -translate-x-1/2 rounded-t-xl bg-slate-800" />
              <div className="absolute bottom-10 left-16 h-8 w-8 rounded-lg bg-blue-100" />
              <div className="absolute bottom-10 right-16 h-8 w-8 rounded-lg bg-blue-100" />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-950">
                  {t('registerPreview.cardTitle')}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {t('registerPreview.cardSubtitle')}
                </p>
              </div>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                {t('registerPreview.cardStatus')}
              </span>
            </div>
          </div>

          <div className="absolute left-8 top-1/2 h-12 w-12 rounded-full bg-emerald-600 shadow-lg" />
          <div className="absolute left-12 top-[47%] h-14 w-4 rounded-full bg-[#7a4f2b]" />

          <div className="absolute right-10 top-14 h-14 w-14 rounded-full bg-emerald-600 shadow-lg" />
          <div className="absolute right-16 top-[90px] h-16 w-4 rounded-full bg-[#7a4f2b]" />

          <div className="absolute bottom-5 left-5 right-5 rounded-[24px] border border-white/70 bg-white/80 p-4 text-slate-900 shadow-lg backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
              {t('registerPreview.bottomBadge')}
            </p>

            <p className="mt-1 text-sm font-semibold">
              {t('registerPreview.bottomText')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function RegisterPage() {
  const { register: registerUser } = useAuth()
  const { t, i18n } = useTranslation()

  const [isSuccess, setIsSuccess] = useState(false)
  const [registerError, setRegisterError] = useState('')

  const translatedRegisterSchema = useMemo(
    () => registerSchema(t),
    [t, i18n.language],
  )

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    clearErrors,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(translatedRegisterSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreement: false,
    },
  })

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSuccess(false)
    setRegisterError('')

    try {
      await registerUser({
        email: data.email,
        password: data.password,
        agreement: data.agreement,
      })

      setIsSuccess(true)
      
      reset({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreement: false,
      })

clearErrors()
    } catch (error) {
      console.error(error)

      setRegisterError(t('auth.registerError'))
    }
  }

  return (
    <section className="mx-auto max-w-6xl">
      <div className="overflow-hidden rounded-[36px] border border-[#e2d6c3] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="grid min-h-[720px] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden p-5 lg:block">
            <AuthEstatePreview />
          </div>

          <div className="flex items-center p-6 sm:p-8 lg:p-10">
            <div className="w-full">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">
                {t('auth.registerBadge')}
              </p>

              <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950">
                {t('auth.registerTitle')}
              </h1>

              <p className="mt-3 max-w-md leading-7 text-slate-600">
                {t('auth.registerSubtitle')}
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-semibold text-slate-800"
                  >
                    {t('auth.name')}
                  </label>

                  <input
                    id="fullName"
                    type="text"
                    placeholder={t('auth.namePlaceholder')}
                    {...register('fullName')}
                    className="mt-2 w-full rounded-[22px] border border-[#d9cdb8] bg-[#fcfaf6] px-5 py-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                  {errors.fullName && (
                    <p className="mt-2 text-sm font-medium text-red-600">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

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

                <div className="grid gap-5 sm:grid-cols-2">
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
                      placeholder={t('auth.passwordMinPlaceholder')}
                      {...register('password')}
                      className="mt-2 w-full rounded-[22px] border border-[#d9cdb8] bg-[#fcfaf6] px-5 py-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />

                    {errors.password && (
                      <p className="mt-2 text-sm font-medium text-red-600">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-semibold text-slate-800"
                    >
                      {t('auth.confirmPassword')}
                    </label>

                    <input
                      id="confirmPassword"
                      type="password"
                      placeholder={t('auth.confirmPasswordPlaceholder')}
                      {...register('confirmPassword')}
                      className="mt-2 w-full rounded-[22px] border border-[#d9cdb8] bg-[#fcfaf6] px-5 py-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />

                    {errors.confirmPassword && (
                      <p className="mt-2 text-sm font-medium text-red-600">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="flex cursor-pointer items-start gap-3 rounded-[24px] border border-[#e2d6c3] bg-[#fcfaf6] p-4 text-sm leading-6 text-slate-700 transition hover:bg-white hover:shadow-sm">
                    <input
                      type="checkbox"
                      {...register('agreement')}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />

                    <span>{t('auth.agreementText')}</span>
                  </label>

                  {errors.agreement && (
                    <p className="mt-2 text-sm font-medium text-red-600">
                      {errors.agreement.message}
                    </p>
                  )}
                </div>

                {registerError && (
                  <div className="rounded-[22px] border border-red-200 bg-red-50 p-4">
                    <p className="text-sm font-semibold text-red-700">
                      {registerError}
                    </p>
                  </div>
                )}

                {isSuccess && (
                  <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-sm font-semibold text-emerald-800">
                      {t('auth.registerSuccessText')}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl bg-blue-600 px-6 py-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 disabled:cursor-not-allowed disabled:bg-blue-300 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  {isSubmitting
                    ? t('common.loading')
                    : t('auth.submitRegister')}
                </button>
              </form>

              <div className="mt-6 rounded-[24px] border border-[#e2d6c3] bg-[#fcfaf6] p-4">
                <p className="text-sm leading-6 text-slate-600">
                  {t('auth.alreadyHaveAccount')}{' '}
                  <Link
                    to="/login"
                    className="font-bold text-blue-600 hover:text-blue-700"
                  >
                    {t('auth.loginLink')}
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-[#e2d6c3] bg-gradient-to-br from-[#0f9f8c] via-[#1454d8] to-[#081f5c] p-6 text-white lg:hidden">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-100">
              {t('registerPreview.badge')}
            </p>

            <p className="mt-2 text-sm leading-6 text-emerald-50/95">
              {t('registerPreview.mobileText')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}