// Схема валидации формы входа.
// Проверяет email и пароль перед отправкой данных на backend.

import type { TFunction } from 'i18next'
import { z } from 'zod'

export function loginSchema(t: TFunction) {
  return z.object({
    email: z
      .string()
      .min(1, t('validation.emailRequired'))
      .email(t('validation.emailInvalid')),

    password: z
      .string()
      .min(1, t('validation.passwordRequired'))
      .min(6, t('validation.passwordMin')),
  })
}

export type LoginFormValues = z.input<ReturnType<typeof loginSchema>>