// Страница создания объявления.
// Форма отправляет основные данные на backend endpoint /listings/add_listing.
// Также содержит загрузку фото с preview и drag&drop.
// Блок инфраструктуры показывается для всех объявлений.
// Блок инвестиций показывается только для продажи.

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  createProperty,
  uploadPropertyPhotos,
} from '../../api/propertiesApi'
import { roomsOptions } from '../../lib/constants'
import {
  createPropertySchema,
  type CreatePropertyFormValues,
  type CreatePropertySubmitValues,
} from './createPropertySchema'

const MAX_PHOTOS_COUNT = 6

const infrastructureOptions = [
  { name: 'hasMetro', labelKey: 'createPropertyPage.hasMetro' },
  { name: 'hasSchool', labelKey: 'createPropertyPage.hasSchool' },
  { name: 'hasKindergarten', labelKey: 'createPropertyPage.hasKindergarten' },
  { name: 'hasPark', labelKey: 'createPropertyPage.hasPark' },
  { name: 'hasShops', labelKey: 'createPropertyPage.hasShops' },
  { name: 'hasHospital', labelKey: 'createPropertyPage.hasHospital' },
] as const

const optionalNumberField = {
  setValueAs: (value: string) => (value === '' ? undefined : Number(value)),
}

export function CreatePropertyPage() {
  const { t } = useTranslation()

  const [isSuccess, setIsSuccess] = useState(false)
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([])
  const [photoError, setPhotoError] = useState('')
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
    watch,
    setValue,
  } = useForm<CreatePropertyFormValues, unknown, CreatePropertySubmitValues>({
    resolver: zodResolver(createPropertySchema),
    defaultValues: {
      type: 'sale',
      title: '',
      description: '',
      price: 0,
      address: '',
      area: 0,
      rooms: 1,

      hasMetro: false,
      hasSchool: false,
      hasKindergarten: false,
      hasPark: false,
      hasShops: false,
      hasHospital: false,

      monthlyRent: undefined,
      rentalYield: undefined,
      resaleProfit: undefined,
      investmentComment: '',
    },
  })

  const selectedDealType = watch('type')

  useEffect(() => {
    if (selectedDealType !== 'rent') {
      return
    }

    setValue('monthlyRent', undefined)
    setValue('rentalYield', undefined)
    setValue('resaleProfit', undefined)
    setValue('investmentComment', '')
  }, [selectedDealType, setValue])

  const createPropertyMutation = useMutation({
    mutationFn: async (data: CreatePropertySubmitValues) => {
      const infrastructure = [
        data.hasMetro ? 1 : null,
        data.hasSchool ? 2 : null,
        data.hasKindergarten ? 3 : null,
        data.hasPark ? 4 : null,
        data.hasShops ? 5 : null,
        data.hasHospital ? 6 : null,
      ].filter((item): item is number => item !== null)

      const hasInvestmentData =
        data.monthlyRent !== undefined ||
        data.rentalYield !== undefined ||
        data.resaleProfit !== undefined ||
        Boolean(data.investmentComment?.trim())

      const investment =
        data.type === 'sale' && hasInvestmentData
          ? {
              annual_yield: data.rentalYield ?? 1,
              min_investment: data.resaleProfit ?? data.monthlyRent ?? 1,
              payback_years: 1,
              roi: data.rentalYield ?? 1,
            }
          : null

      const createdProperty = await createProperty({
        type: data.type,
        title: data.title,
        description: data.description,
        price: data.price,
        rooms: data.rooms,
        area: data.area,
        address: data.address,
        status: 'moderation',
        photos: [],
        infrastructure,
        investment,
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
      setPhotoError('')

      reset({
        type: 'sale',
        title: '',
        description: '',
        price: 0,
        address: '',
        area: 0,
        rooms: 1,

        hasMetro: false,
        hasSchool: false,
        hasKindergarten: false,
        hasPark: false,
        hasShops: false,
        hasHospital: false,

        monthlyRent: undefined,
        rentalYield: undefined,
        resaleProfit: undefined,
        investmentComment: '',
      })
    },
  })

  const addPhotos = (files: FileList | File[]) => {
    const newFiles = Array.from(files)

    const imageFiles = newFiles.filter((file) => file.type.startsWith('image/'))

    if (imageFiles.length === 0) {
      setPhotoError(t('createPropertyPage.onlyImagesError'))
      return
    }

    if (imageFiles.length !== newFiles.length) {
      setPhotoError(t('createPropertyPage.someFilesError'))
      return
    }

    if (selectedPhotos.length + imageFiles.length > MAX_PHOTOS_COUNT) {
      setPhotoError(
        t('createPropertyPage.maxPhotosError', {
          count: MAX_PHOTOS_COUNT,
        }),
      )
      return
    }

    setSelectedPhotos((currentPhotos) => [...currentPhotos, ...imageFiles])
    setPhotoError('')
  }

  const removePhoto = (photoIndex: number) => {
    setSelectedPhotos((currentPhotos) =>
      currentPhotos.filter((_, index) => index !== photoIndex),
    )

    setPhotoError('')
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      addPhotos(event.target.files)
    }

    event.target.value = ''
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)

    addPhotos(event.dataTransfer.files)
  }

  const onSubmit = (data: CreatePropertySubmitValues) => {
    setIsSuccess(false)
    createPropertyMutation.reset()

    createPropertyMutation.mutate(data)
  }

  return (
    <section className="mx-auto max-w-3xl rounded-2xl bg-white p-4 shadow-sm sm:p-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-blue-600">
          {t('createPropertyPage.badge')}
        </p>

        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          {t('createPropertyPage.title')}
        </h1>

        <p className="mt-2 text-slate-600">
          {t('createPropertyPage.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-slate-700"
          >
            {t('createPropertyPage.dealType')}
          </label>

          <select
            id="type"
            {...register('type')}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
          >
            <option value="sale">{t('property.sale')}</option>
            <option value="rent">{t('property.rent')}</option>
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
            {t('createPropertyPage.titleLabel')}
          </label>

          <input
            id="title"
            type="text"
            placeholder={t('createPropertyPage.titlePlaceholder')}
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
            {t('createPropertyPage.description')}
          </label>

          <textarea
            id="description"
            placeholder={t('createPropertyPage.descriptionPlaceholder')}
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
            {t('createPropertyPage.price')}
          </label>

          <input
            id="price"
            type="number"
            placeholder={t('createPropertyPage.pricePlaceholder')}
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
            {t('createPropertyPage.address')}
          </label>

          <input
            id="address"
            type="text"
            placeholder={t('createPropertyPage.addressPlaceholder')}
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
              {t('createPropertyPage.area')}
            </label>

            <input
              id="area"
              type="number"
              placeholder={t('createPropertyPage.areaPlaceholder')}
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
              {t('createPropertyPage.rooms')}
            </label>

            <select
              id="rooms"
              {...register('rooms', { valueAsNumber: true })}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            >
              {roomsOptions.map((room) => (
                <option key={room} value={room}>
                  {room === 0 ? t('createPropertyPage.studio') : room}
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

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            {t('createPropertyPage.infrastructureTitle')}
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            {t('createPropertyPage.infrastructureSubtitle')}
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {infrastructureOptions.map((option) => (
              <label
                key={option.name}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-700 transition hover:border-blue-300"
              >
                <input
                  type="checkbox"
                  {...register(option.name)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />

                <span>{t(option.labelKey)}</span>
              </label>
            ))}
          </div>
        </div>

        {selectedDealType === 'sale' && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-slate-900">
              {t('createPropertyPage.investmentTitle')}
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              {t('createPropertyPage.investmentSubtitle')}
            </p>

            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="monthlyRent"
                  className="block text-sm font-medium text-slate-700"
                >
                  {t('createPropertyPage.monthlyRent')}
                </label>

                <input
                  id="monthlyRent"
                  type="number"
                  placeholder={t('createPropertyPage.monthlyRentPlaceholder')}
                  {...register('monthlyRent', optionalNumberField)}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500"
                />

                {errors.monthlyRent && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.monthlyRent.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="rentalYield"
                  className="block text-sm font-medium text-slate-700"
                >
                  {t('createPropertyPage.rentalYield')}
                </label>

                <input
                  id="rentalYield"
                  type="number"
                  step="0.1"
                  placeholder={t('createPropertyPage.rentalYieldPlaceholder')}
                  {...register('rentalYield', optionalNumberField)}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500"
                />

                {errors.rentalYield && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.rentalYield.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="resaleProfit"
                  className="block text-sm font-medium text-slate-700"
                >
                  {t('createPropertyPage.resaleProfit')}
                </label>

                <input
                  id="resaleProfit"
                  type="number"
                  placeholder={t('createPropertyPage.resaleProfitPlaceholder')}
                  {...register('resaleProfit', optionalNumberField)}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500"
                />

                {errors.resaleProfit && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.resaleProfit.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="investmentComment"
                  className="block text-sm font-medium text-slate-700"
                >
                  {t('createPropertyPage.investmentComment')}
                </label>

                <input
                  id="investmentComment"
                  type="text"
                  placeholder={t(
                    'createPropertyPage.investmentCommentPlaceholder',
                  )}
                  {...register('investmentComment')}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500"
                />

                {errors.investmentComment && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.investmentComment.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div>
          <p className="block text-sm font-medium text-slate-700">
            {t('createPropertyPage.photos')}
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
              {t('createPropertyPage.dragPhotos')}
            </p>

            <p className="mt-1 text-sm text-slate-600">
              {t('createPropertyPage.choosePhotosText', {
                count: MAX_PHOTOS_COUNT,
              })}
            </p>

            <button
              type="button"
              onClick={openFileDialog}
              className="mt-4 rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              {t('createPropertyPage.choosePhotosButton')}
            </button>
          </div>

          {photoError && (
            <p className="mt-2 text-sm font-medium text-red-600">
              {photoError}
            </p>
          )}

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
                      {t('createPropertyPage.deletePhoto')}
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
            ? t('createPropertyPage.submitting')
            : t('createPropertyPage.submit')}
        </button>
      </form>

      {isSuccess && (
        <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-4">
          <h2 className="font-semibold text-green-800">
            {t('createPropertyPage.successTitle')}
          </h2>

          <p className="mt-2 text-sm text-green-700">
            {t('createPropertyPage.successText')}
          </p>
        </div>
      )}

      {createPropertyMutation.isError && (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">
            {t('createPropertyPage.errorText')}
          </p>
        </div>
      )}
    </section>
  )
}