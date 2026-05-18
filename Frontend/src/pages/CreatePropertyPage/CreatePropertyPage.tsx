// Страница создания объявления.
// Форма отправляет данные на backend endpoint /listings/add_listing.

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { createProperty } from '../../api/propertiesApi'
import { dealTypeOptions, roomsOptions } from '../../lib/constants'
import {
  createPropertySchema,
  type CreatePropertyFormValues,
} from './createPropertySchema'

export function CreatePropertyPage() {
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreatePropertyFormValues>({
    resolver: zodResolver(createPropertySchema),
    defaultValues: {
      type: 'sale',
      title: '',
      description: '',
      price: 0,
      address: '',
      area: 0,
      rooms: 1,
    },
  })

  const createPropertyMutation = useMutation({
    mutationFn: createProperty,
    onSuccess: () => {
      setIsSuccess(true)

      reset({
        type: 'sale',
        title: '',
        description: '',
        price: 0,
        address: '',
        area: 0,
        rooms: 1,
      })
    },
  })

  const onSubmit = (data: CreatePropertyFormValues) => {
    setIsSuccess(false)

    createPropertyMutation.mutate({
      ...data,
      status: 'draft',
      photos: [],
    })
  }

  return (
    <section className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-blue-600">
          Новое объявление
        </p>

        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          Создать объявление
        </h1>

        <p className="mt-2 text-slate-600">
          Заполните базовые данные объекта недвижимости. Объявление будет
          отправлено на backend.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-slate-700"
          >
            Тип сделки
          </label>

          <select
            id="type"
            {...register('type')}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
          >
            {dealTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {errors.type && (
            <p className="mt-2 text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-slate-700"
          >
            Заголовок объявления
          </label>

          <input
            id="title"
            type="text"
            placeholder="Например, светлая квартира рядом с метро"
            {...register('title')}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
          />

          {errors.title && (
            <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-slate-700"
          >
            Описание
          </label>

          <textarea
            id="description"
            placeholder="Опишите объект недвижимости"
            rows={5}
            {...register('description')}
            className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
          />

          {errors.description && (
            <p className="mt-2 text-sm text-red-600">
              {errors.description.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-slate-700"
          >
            Цена
          </label>

          <input
          id="price"
          type="number"
          placeholder="Например, 8500000"
          {...register('price', { valueAsNumber: true })}
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
          />

          {errors.price && (
            <p className="mt-2 text-sm text-red-600">{errors.price.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-slate-700"
          >
            Адрес
          </label>

          <input
            id="address"
            type="text"
            placeholder="Например, Екатеринбург, ул. Мира, 19"
            {...register('address')}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
          />

          {errors.address && (
            <p className="mt-2 text-sm text-red-600">
              {errors.address.message}
            </p>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="area"
              className="block text-sm font-medium text-slate-700"
            >
              Площадь, м²
            </label>

            <input
            id="area"
            type="number"
            placeholder="Например, 56"
            {...register('area', { valueAsNumber: true })}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            />

            {errors.area && (
              <p className="mt-2 text-sm text-red-600">
                {errors.area.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="rooms"
              className="block text-sm font-medium text-slate-700"
            >
              Количество комнат
            </label>

            <select
            id="rooms"
            {...register('rooms', { valueAsNumber: true })}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            >
              {roomsOptions.map((room) => (
                <option key={room} value={room}>
                  {room === 0 ? 'Студия' : room}
                </option>
              ))}
            </select>

            {errors.rooms && (
              <p className="mt-2 text-sm text-red-600">
                {errors.rooms.message}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={createPropertyMutation.isPending}
          className="w-full rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {createPropertyMutation.isPending
            ? 'Создание...'
            : 'Создать объявление'}
        </button>
      </form>

      {isSuccess && (
        <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-4">
          <h2 className="font-semibold text-green-800">
            Объявление успешно отправлено на backend
          </h2>
        </div>
      )}

      {createPropertyMutation.isError && (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">
            Не удалось создать объявление. Проверьте, запущен ли backend и
            выполнен ли вход в аккаунт.
          </p>
        </div>
      )}
    </section>
  )
}