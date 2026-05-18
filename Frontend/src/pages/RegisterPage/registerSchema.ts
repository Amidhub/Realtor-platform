// Схема валидации формы регистрации.
// Проверяет имя, email, пароль и совпадение подтверждения пароля.

import { z } from 'zod'

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Введите имя')
      .min(2, 'Имя должно содержать минимум 2 символа')
      .max(60, 'Имя слишком длинное'),

    email: z
      .string()
      .min(1, 'Введите email')
      .email('Введите корректный email'),

    password: z
      .string()
      .min(1, 'Введите пароль')
      .min(6, 'Пароль должен содержать минимум 6 символов'),

    confirmPassword: z
      .string()
      .min(1, 'Повторите пароль'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>