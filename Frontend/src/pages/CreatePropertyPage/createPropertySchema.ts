// Схема валидации формы создания объявления.
// Основные поля соответствуют backend-схеме Listing_S.
// Поля инфраструктуры и инвестиций пока используются на frontend для 4 недели.

import { z } from 'zod'

export const createPropertySchema = z.object({
  type: z.enum(['sale', 'rent'], {
    message: 'Выберите тип сделки',
  }),

  title: z
    .string()
    .min(5, 'Заголовок должен содержать минимум 5 символов')
    .max(200, 'Заголовок слишком длинный'),

  description: z
    .string()
    .min(10, 'Описание должно содержать минимум 10 символов')
    .max(5000, 'Описание слишком длинное'),

  price: z
    .number({
      message: 'Введите цену',
    })
    .positive('Цена должна быть больше 0')
    .max(1_000_000_000, 'Цена слишком большая'),

  address: z
    .string()
    .min(5, 'Адрес должен содержать минимум 5 символов')
    .max(300, 'Адрес слишком длинный'),

  area: z
    .number({
      message: 'Введите площадь',
    })
    .positive('Площадь должна быть больше 0')
    .max(5000, 'Площадь слишком большая'),

  rooms: z
    .number({
      message: 'Введите количество комнат',
    })
    .int('Количество комнат должно быть целым числом')
    .min(0, 'Количество комнат не может быть отрицательным')
    .max(20, 'Слишком большое количество комнат'),

  hasMetro: z.boolean(),
  hasSchool: z.boolean(),
  hasKindergarten: z.boolean(),
  hasPark: z.boolean(),
  hasShops: z.boolean(),
  hasHospital: z.boolean(),

  monthlyRent: z
    .number()
    .positive('Значение должно быть больше 0')
    .optional(),

  rentalYield: z
    .number()
    .positive('Значение должно быть больше 0')
    .optional(),

  resaleProfit: z
    .number()
    .positive('Значение должно быть больше 0')
    .optional(),

  investmentComment: z
    .string()
    .max(500, 'Комментарий слишком длинный')
    .optional(),
})

export type CreatePropertyFormValues = z.input<typeof createPropertySchema>
export type CreatePropertySubmitValues = z.output<typeof createPropertySchema>