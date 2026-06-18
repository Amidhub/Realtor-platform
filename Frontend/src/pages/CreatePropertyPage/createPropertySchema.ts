// Схема валидации формы создания объявления.
// Основные поля соответствуют backend-схеме Listing_S.
// Поля инфраструктуры и инвестиций используются на frontend.

import type { TFunction } from 'i18next'
import { z } from 'zod'

export function createPropertySchema(t: TFunction) {
  return z.object({
    type: z.enum(['sale', 'rent'], {
      message: t('validation.dealTypeRequired'),
    }),

    title: z
      .string()
      .min(5, t('validation.titleMin'))
      .max(200, t('validation.titleMax')),

    description: z
      .string()
      .min(10, t('validation.descriptionMin'))
      .max(5000, t('validation.descriptionMax')),

    price: z
      .number({
        message: t('validation.priceRequired'),
      })
      .positive(t('validation.pricePositive'))
      .max(1_000_000_000, t('validation.priceMax')),

    address: z
      .string()
      .min(5, t('validation.addressMin'))
      .max(300, t('validation.addressMax')),

    area: z
      .number({
        message: t('validation.areaRequired'),
      })
      .positive(t('validation.areaPositive'))
      .max(5000, t('validation.areaMax')),

    rooms: z
      .number({
        message: t('validation.roomsRequired'),
      })
      .int(t('validation.roomsInteger'))
      .min(0, t('validation.roomsMin'))
      .max(20, t('validation.roomsMax')),

    hasMetro: z.boolean(),
    hasSchool: z.boolean(),
    hasKindergarten: z.boolean(),
    hasPark: z.boolean(),
    hasShops: z.boolean(),
    hasHospital: z.boolean(),

    monthlyRent: z.number().positive(t('validation.positiveValue')).optional(),

    rentalYield: z.number().positive(t('validation.positiveValue')).optional(),

    resaleProfit: z.number().positive(t('validation.positiveValue')).optional(),

    investmentComment: z
      .string()
      .max(500, t('validation.commentMax'))
      .optional(),
  })
}

export type CreatePropertyFormValues = z.input<
  ReturnType<typeof createPropertySchema>
>

export type CreatePropertySubmitValues = z.output<
  ReturnType<typeof createPropertySchema>
>