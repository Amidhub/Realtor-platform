// Страница создания объявления.
// Форма отправляет данные на backend endpoint /listings/add_listing.
// Также содержит загрузку фото с preview и drag&drop.

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  createProperty,
  uploadPropertyPhotos,
} from '../../api/propertiesApi'
import { dealTypeOptions, roomsOptions } from '../../lib/constants'
import {
  createPropertySchema,
  type CreatePropertyFormValues,
} from './createPropertySchema'

const MAX_PHOTOS_COUNT = 6

export function CreatePropertyPage() {
  const [isSuccess, setIsSuccess] = useState(false)
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const photoPreviews = useMemo(
    () =>
      selectedPhotos.map((file) => ({
        id: `${file.name}-${file.lastModified}`,
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    [selectedPhotos],
  )

  useEffect(() => {
    return () => {
      photoPreviews.forEach((preview) => {
        URL.revokeObjectURL(preview.url)
      })
    }
  }, [photoPreviews])

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
    mutationFn: async (data: CreatePropertyFormValues) => {
      const createdProperty = await createProperty({
        ...data,
        status: 'draft',
        photos: [],
      })
  
      if (selectedPhotos.length > 0) {
        if (!createdProperty.id) {
          throw new Error('Backend не вернул id созданного объявления')
        }
  
        await uploadPropertyPhotos(createdProperty.id, selectedPhotos)
      }
  
      return createdProperty
    },
  
    onSuccess: () => {
      setIsSuccess(true)
      setSelectedPhotos([])
  
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

  const addPhotos = (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith('image/'),
    )

    setSelectedPhotos((currentPhotos) => {
      const availableSlots = MAX_PHOTOS_COUNT - currentPhotos.length
      const photosToAdd = imageFiles.slice(0, availableSlots)

      return [...currentPhotos, ...photosToAdd]
    })
  }

  const removePhoto = (photoIndex: number) => {
    setSelectedPhotos((currentPhotos) =>
      currentPhotos.filter((_, index) => index !== photoIndex),
    )
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (event.target.files) {
      addPhotos(event.target.files)
    }

    event.target.value = ''
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)

    addPhotos(event.dataTransfer.files)
  }

  const onSubmit = (data: CreatePropertyFormValues) => {
    setIsSuccess(false)
    createPropertyMutation.reset()
  
    createPropertyMutation.mutate(data)
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
          Заполните данные объекта недвижимости и добавьте фотографии. После создания
          объявления фото будут загружены и появятся в каталоге.
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

        <div>
          <p className="block text-sm font-medium text-slate-700">
            Фотографии объекта
          </p>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={[
              'mt-2 rounded-2xl border-2 border-dashed p-6 text-center transition',
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-300 bg-slate-50 hover:border-blue-400',
            ].join(' ')}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
            />

            <p className="text-sm font-medium text-slate-900">
              Перетащите фото сюда
            </p>

            <p className="mt-1 text-sm text-slate-600">
              или выберите файлы вручную. Максимум {MAX_PHOTOS_COUNT} фото.
            </p>

            <button
              type="button"
              onClick={openFileDialog}
              className="mt-4 rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Выбрать фото
            </button>
          </div>

          {photoPreviews.length > 0 && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {photoPreviews.map((preview, index) => (
                <div
                  key={preview.id}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                  <img
                    src={preview.url}
                    alt={preview.name}
                    className="h-36 w-full object-cover"
                  />

                  <div className="flex items-center justify-between gap-3 p-3">
                    <p className="truncate text-sm text-slate-600">
                      {preview.name}
                    </p>

                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
            Объявление успешно создано
          </h2>

          <p className="mt-2 text-sm text-green-700">
            Если вы добавили фотографии, они загружены и будут отображаться в
            каталоге.
          </p>
        </div>
      )}

      {createPropertyMutation.isError && (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">
            Не удалось создать объявление или загрузить фотографии. Проверьте данные и
            попробуйте ещё раз.
          </p>
        </div>
      )}
    </section>
  )
}