// Схема валидации формы регистрации.
// Проверяет имя, email, пароль, подтверждение пароля и согласие пользователя.

import type { TFunction } from 'i18next'
import { z } from 'zod'

export function registerSchema(t: TFunction) {
  return z
    .object({
      fullName: z
        .string()
        .min(1, t('validation.nameRequired'))
        .min(2, t('validation.nameMin'))
        .max(60, t('validation.nameMax')),

      email: z
        .string()
        .min(1, t('validation.emailRequired'))
        .email(t('validation.emailInvalid')),

      password: z
        .string()
        .min(1, t('validation.passwordRequired'))
        .min(6, t('validation.passwordMin')),

      confirmPassword: z.string().min(1, t('validation.confirmPasswordRequired')),

      agreement: z.boolean().refine((value) => value === true, {
        message: t('validation.agreementRequired'),
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('validation.passwordsDoNotMatch'),
      path: ['confirmPassword'],
    })
}

export type RegisterFormValues = z.input<ReturnType<typeof registerSchema>>