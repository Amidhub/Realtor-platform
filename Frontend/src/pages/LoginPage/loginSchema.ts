// Схема валидации формы входа.
// Проверяет email и пароль перед будущей отправкой данных на backend.

import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Введите email')
    .email('Введите корректный email'),

  password: z
    .string()
    .min(1, 'Введите пароль')
    .min(6, 'Пароль должен содержать минимум 6 символов'),
})

export type LoginFormValues = z.infer<typeof loginSchema>