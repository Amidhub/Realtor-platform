// Страница регистрации пользователя.
// Содержит форму создания аккаунта с базовой валидацией.
// Backend принимает только email и password, fullName пока остаётся только на frontend.

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../app/AuthContext'
import { registerSchema, type RegisterFormValues } from './registerSchema'

export function RegisterPage() {
  const { register: registerUser } = useAuth()
  const { t } = useTranslation()
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: RegisterFormValues) => {
    await registerUser({
      email: data.email,
      password: data.password,
    })

    console.log('Registration data:', data)

    setIsSuccess(true)
    reset()
  }

  return (
    <section className="mx-auto max-w-md rounded-2xl bg-white p-4 shadow-sm sm:p-8">
      <h1 className="text-2xl font-bold text-slate-900">
        {t('auth.registerTitle')}
      </h1>

      <p className="mt-2 text-slate-600">
        {t('auth.registerSubtitle')}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-slate-700"
          >
            {t('auth.name')}
          </label>

          <input
            id="fullName"
            type="text"
            placeholder={t('auth.namePlaceholder')}
            {...register('fullName')}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
          />

          {errors.fullName && (
            <p className="mt-2 text-sm text-red-600">
              {errors.fullName.message}
            </p>
          )}
        </div>

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
            placeholder={t('auth.passwordMinPlaceholder')}
            {...register('password')}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
          />

          {errors.password && (
            <p className="mt-2 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-slate-700"
          >
            {t('auth.confirmPassword')}
          </label>

          <input
            id="confirmPassword"
            type="password"
            placeholder={t('auth.confirmPasswordPlaceholder')}
            {...register('confirmPassword')}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
          />

          {errors.confirmPassword && (
            <p className="mt-2 text-sm text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isSubmitting ? t('common.loading') : t('auth.submitRegister')}
        </button>
      </form>

      {isSuccess && (
        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-800">
            {t('auth.registerSuccessText')}
          </p>
        </div>
      )}
    </section>
  )
}