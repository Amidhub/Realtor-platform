import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
} from 'react'
import { useForm, type UseFormRegisterReturn } from 'react-hook-form'
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
  const { t, i18n } = useTranslation()

  const translatedCreatePropertySchema = useMemo(
    () => createPropertySchema(t),
    [t, i18n.language],
  )

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
    clearErrors,
  } = useForm<CreatePropertyFormValues, unknown, CreatePropertySubmitValues>({
    resolver: zodResolver(translatedCreatePropertySchema),
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
  const selectedRooms = watch('rooms')

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

      clearErrors()
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
    <section className="mx-auto max-w-7xl space-y-6">
      <div className="overflow-hidden rounded-[36px] border border-[#e2d6c3] bg-white shadow-sm">
        <div className="grid lg:grid-cols-[1fr_0.95fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">
              {t('createPropertyPage.badge')}
            </p>

            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              {t('createPropertyPage.title')}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              {t('createPropertyPage.subtitle')}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <StatusPill>{t('createPropertyPage.statusData')}</StatusPill>
              <StatusPill>{t('createPropertyPage.statusPhotos')}</StatusPill>
              <StatusPill>
                {t('createPropertyPage.statusModeration')}
              </StatusPill>
            </div>
          </div>

          <div className="relative hidden overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-slate-950 p-6 text-white sm:p-8 lg:block lg:p-8">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-24 left-8 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />

            <div className="relative flex h-full min-h-[280px] flex-col justify-between gap-4">
              <div className="rounded-[30px] border border-white/20 bg-white/15 p-5 backdrop-blur sm:p-6">
                <p className="text-sm text-blue-100">
                  {t('createPropertyPage.afterSendingLabel')}
                </p>

                <p className="mt-2 text-2xl font-bold sm:text-3xl">
                  {t('createPropertyPage.afterSendingStatus')}
                </p>

                <p className="mt-3 text-sm leading-6 text-blue-100">
                  {t('createPropertyPage.afterSendingText')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-3xl bg-white/15 p-4 backdrop-blur sm:p-5">
                  <p className="text-sm text-blue-100">
                    {t('createPropertyPage.photoCounterLabel')}
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {selectedPhotos.length}/{MAX_PHOTOS_COUNT}
                  </p>
                </div>

                <div className="rounded-3xl bg-white/15 p-4 backdrop-blur sm:p-5">
                  <p className="text-sm text-blue-100">
                    {t('createPropertyPage.dealTypeShort')}
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {selectedDealType === 'sale'
                      ? t('property.sale')
                      : t('property.rent')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {createPropertyMutation.isError && (
        <div className="rounded-[28px] border border-red-200 bg-red-50 p-5 shadow-sm">
          <p className="text-sm font-semibold text-red-700">
            {t('createPropertyPage.errorText')}
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-6 lg:grid-cols-[280px_1fr]"
      >
        <aside className="hidden h-fit rounded-[32px] border border-[#e2d6c3] bg-white p-5 shadow-sm lg:sticky lg:top-24 lg:block">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            {t('createPropertyPage.fillingBadge')}
          </p>

          <div className="mt-5 space-y-3">
            <StepItem
              number="01"
              title={t('createPropertyPage.stepBasicTitle')}
              text={t('createPropertyPage.stepBasicText')}
            />

            <StepItem
              number="02"
              title={t('createPropertyPage.stepCharacteristicsTitle')}
              text={t('createPropertyPage.stepCharacteristicsText')}
            />

            <StepItem
              number="03"
              title={t('createPropertyPage.stepInfrastructureTitle')}
              text={t('createPropertyPage.stepInfrastructureText')}
            />

            <StepItem
              number="04"
              title={t('createPropertyPage.stepPhotosTitle')}
              text={t('createPropertyPage.stepPhotosText')}
            />
          </div>

          <div className="mt-6 rounded-3xl bg-[#f7f2e8] p-4">
            <p className="text-sm font-bold text-slate-950">
              {t('createPropertyPage.hintTitle')}
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {t('createPropertyPage.hintText')}
            </p>
          </div>
        </aside>

        <div className="space-y-6">
          <SectionCard
            number="01"
            title={t('createPropertyPage.basicSectionTitle')}
            text={t('createPropertyPage.basicSectionText')}
          >
            <input type="hidden" {...register('type')} />

            <div className="grid gap-4 md:grid-cols-2">
              <DealTypeCard
                title={t('property.sale')}
                text={t('createPropertyPage.saleDescription')}
                isActive={selectedDealType === 'sale'}
                onClick={() =>
                  setValue('type', 'sale', {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              />

              <DealTypeCard
                title={t('property.rent')}
                text={t('createPropertyPage.rentDescription')}
                isActive={selectedDealType === 'rent'}
                onClick={() =>
                  setValue('type', 'rent', {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              />
            </div>

            {errors.type && <ErrorText>{errors.type.message}</ErrorText>}

            <div className="mt-6 grid gap-5">
              <FormInput
                id="title"
                type="text"
                label={t('createPropertyPage.titleLabel')}
                placeholder={t('createPropertyPage.titlePlaceholder')}
                registration={register('title')}
                error={errors.title?.message}
              />

              <div>
                <FieldLabel htmlFor="description">
                  {t('createPropertyPage.description')}
                </FieldLabel>

                <textarea
                  id="description"
                  placeholder={t('createPropertyPage.descriptionPlaceholder')}
                  rows={6}
                  {...register('description')}
                  className="mt-2 w-full resize-none rounded-[24px] border border-[#d9cdb8] bg-[#fbfaf7] px-5 py-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />

                {errors.description && (
                  <ErrorText>{errors.description.message}</ErrorText>
                )}
              </div>
            </div>
          </SectionCard>

          <SectionCard
            number="02"
            title={t('createPropertyPage.characteristicsSectionTitle')}
            text={t('createPropertyPage.characteristicsSectionText')}
            accent="blue"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <FormInput
                id="price"
                type="number"
                label={t('createPropertyPage.price')}
                placeholder={t('createPropertyPage.pricePlaceholder')}
                registration={register('price', { valueAsNumber: true })}
                error={errors.price?.message}
              />

              <FormInput
                id="address"
                type="text"
                label={t('createPropertyPage.address')}
                placeholder={t('createPropertyPage.addressPlaceholder')}
                registration={register('address')}
                error={errors.address?.message}
              />

              <FormInput
                id="area"
                type="number"
                label={t('createPropertyPage.area')}
                placeholder={t('createPropertyPage.areaPlaceholder')}
                registration={register('area', { valueAsNumber: true })}
                error={errors.area?.message}
              />

              <div>
                <input
                  type="hidden"
                  {...register('rooms', { valueAsNumber: true })}
                />

                <p className="block text-sm font-semibold text-slate-800">
                  {t('createPropertyPage.rooms')}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {roomsOptions.map((room) => (
                    <button
                      key={room}
                      type="button"
                      onClick={() =>
                        setValue('rooms', room, {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                      }
                      className={[
                        'rounded-full px-4 py-2 text-sm font-bold transition',
                        selectedRooms === room
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                          : 'bg-[#f7f2e8] text-slate-700 hover:bg-white hover:text-blue-700 hover:shadow-sm',
                      ].join(' ')}
                    >
                      {room === 0 ? t('createPropertyPage.studio') : room}
                    </button>
                  ))}
                </div>

                {errors.rooms && <ErrorText>{errors.rooms.message}</ErrorText>}
              </div>
            </div>
          </SectionCard>

          <SectionCard
            number="03"
            title={t('createPropertyPage.infrastructureTitle')}
            text={t('createPropertyPage.infrastructureSubtitle')}
            accent="green"
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {infrastructureOptions.map((option) => (
                <label key={option.name} className="cursor-pointer">
                  <input
                    type="checkbox"
                    {...register(option.name)}
                    className="peer sr-only"
                  />

                  <span className="flex min-h-20 items-center rounded-[24px] border border-[#e2d6c3] bg-[#fbfaf7] p-4 text-sm font-bold text-slate-700 transition peer-checked:border-emerald-300 peer-checked:bg-emerald-50 peer-checked:text-emerald-700 hover:-translate-y-0.5 hover:bg-white hover:shadow-sm">
                    {t(option.labelKey)}
                  </span>
                </label>
              ))}
            </div>
          </SectionCard>

          {selectedDealType === 'sale' && (
            <SectionCard
              number="04"
              title={t('createPropertyPage.investmentTitle')}
              text={t('createPropertyPage.investmentSubtitle')}
              accent="amber"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <FormInput
                  id="monthlyRent"
                  type="number"
                  label={t('createPropertyPage.monthlyRent')}
                  placeholder={t('createPropertyPage.monthlyRentPlaceholder')}
                  registration={register('monthlyRent', optionalNumberField)}
                  error={errors.monthlyRent?.message}
                />

                <FormInput
                  id="rentalYield"
                  type="number"
                  step="0.1"
                  label={t('createPropertyPage.rentalYield')}
                  placeholder={t('createPropertyPage.rentalYieldPlaceholder')}
                  registration={register('rentalYield', optionalNumberField)}
                  error={errors.rentalYield?.message}
                />

                <FormInput
                  id="resaleProfit"
                  type="number"
                  label={t('createPropertyPage.resaleProfit')}
                  placeholder={t('createPropertyPage.resaleProfitPlaceholder')}
                  registration={register('resaleProfit', optionalNumberField)}
                  error={errors.resaleProfit?.message}
                />

                <FormInput
                  id="investmentComment"
                  type="text"
                  label={t('createPropertyPage.investmentComment')}
                  placeholder={t(
                    'createPropertyPage.investmentCommentPlaceholder',
                  )}
                  registration={register('investmentComment')}
                  error={errors.investmentComment?.message}
                />
              </div>
            </SectionCard>
          )}

          <SectionCard
            number={selectedDealType === 'sale' ? '05' : '04'}
            title={t('createPropertyPage.photos')}
            text={t('createPropertyPage.photosSectionText')}
            accent="blue"
          >
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={[
                'relative overflow-hidden rounded-[30px] border-2 border-dashed p-8 text-center transition',
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-[#d9cdb8] bg-gradient-to-br from-[#fbfaf7] to-white hover:border-blue-300',
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

              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-100 blur-3xl" />

              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-950 text-3xl font-bold text-white shadow-lg shadow-slate-950/20">
                +
              </div>

              <p className="relative mt-5 text-base font-bold text-slate-950">
                {t('createPropertyPage.dragPhotos')}
              </p>

              <p className="relative mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                {t('createPropertyPage.choosePhotosText', {
                  count: MAX_PHOTOS_COUNT,
                })}
              </p>

              <button
                type="button"
                onClick={openFileDialog}
                className="relative mt-5 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20"
              >
                {t('createPropertyPage.choosePhotosButton')}
              </button>
            </div>

            {photoError && (
              <p className="mt-3 text-sm font-semibold text-red-600">
                {photoError}
              </p>
            )}

            {photoPreviews.length > 0 && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {photoPreviews.map((preview, index) => (
                  <div
                    key={preview.id}
                    className="group overflow-hidden rounded-[26px] border border-[#e2d6c3] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <img
                      src={preview.url}
                      alt={preview.name}
                      className="h-44 w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <div className="flex items-center justify-between gap-3 p-4">
                      <p className="truncate text-sm text-slate-600">
                        {preview.name}
                      </p>

                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600 transition hover:bg-red-100"
                      >
                        {t('createPropertyPage.deletePhoto')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <div className="rounded-[30px] border border-[#e2d6c3] bg-white p-5 shadow-sm">
            <button
              type="submit"
              disabled={createPropertyMutation.isPending}
              className="w-full rounded-2xl bg-blue-600 px-6 py-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 disabled:cursor-not-allowed disabled:bg-blue-300 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {createPropertyMutation.isPending
                ? t('createPropertyPage.submitting')
                : t('createPropertyPage.submit')}
            </button>

            {isSuccess && (
              <div className="mt-5 rounded-[28px] border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                <h2 className="font-bold text-emerald-800">
                  {t('createPropertyPage.successTitle')}
                </h2>

                <p className="mt-2 text-sm leading-6 text-emerald-700">
                  {t('createPropertyPage.successText')}
                </p>
              </div>
            )}
          </div>
        </div>
      </form>
    </section>
  )
}

type StatusPillProps = {
  children: ReactNode
}

function StatusPill({ children }: StatusPillProps) {
  return (
    <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
      {children}
    </span>
  )
}

type StepItemProps = {
  number: string
  title: string
  text: string
}

function StepItem({ number, title, text }: StepItemProps) {
  return (
    <div className="rounded-3xl bg-[#fbfaf7] p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-600 text-xs font-bold text-white">
          {number}
        </span>

        <div>
          <p className="font-bold text-slate-950">{title}</p>
          <p className="text-sm text-slate-500">{text}</p>
        </div>
      </div>
    </div>
  )
}

type SectionCardProps = {
  number: string
  title: string
  text: string
  children: ReactNode
  accent?: 'blue' | 'green' | 'amber'
}

function SectionCard({
  number,
  title,
  text,
  children,
  accent = 'blue',
}: SectionCardProps) {
  const accentClassNames = {
    blue: 'from-blue-600 to-blue-800',
    green: 'from-emerald-600 to-emerald-800',
    amber: 'from-amber-500 to-orange-600',
  }

  return (
    <section className="overflow-hidden rounded-[32px] border border-[#e2d6c3] bg-white shadow-sm">
      <div
        className={[
          'bg-gradient-to-r px-5 py-5 text-white sm:px-6',
          accentClassNames[accent],
        ].join(' ')}
      >
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">
          {number}
        </p>

        <h2 className="mt-2 text-2xl font-bold">{title}</h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/75">
          {text}
        </p>
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  )
}

type FieldLabelProps = {
  htmlFor: string
  children: ReactNode
}

function FieldLabel({ htmlFor, children }: FieldLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-semibold text-slate-800"
    >
      {children}
    </label>
  )
}

type ErrorTextProps = {
  children: ReactNode
}

function ErrorText({ children }: ErrorTextProps) {
  return <p className="mt-2 text-sm font-medium text-red-600">{children}</p>
}

type FormInputProps = {
  id: string
  type: string
  label: string
  placeholder?: string
  step?: string
  registration: UseFormRegisterReturn
  error?: string
}

function FormInput({
  id,
  type,
  label,
  placeholder,
  step,
  registration,
  error,
}: FormInputProps) {
  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>

      <input
        id={id}
        type={type}
        step={step}
        placeholder={placeholder}
        {...registration}
        className="mt-2 w-full rounded-[24px] border border-[#d9cdb8] bg-[#fbfaf7] px-5 py-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
      />

      {error && <ErrorText>{error}</ErrorText>}
    </div>
  )
}

type DealTypeCardProps = {
  title: string
  text: string
  isActive: boolean
  onClick: () => void
}

function DealTypeCard({ title, text, isActive, onClick }: DealTypeCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-[28px] border p-5 text-left transition',
        isActive
          ? 'border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-600/20'
          : 'border-[#e2d6c3] bg-[#fbfaf7] text-slate-800 hover:-translate-y-0.5 hover:bg-white hover:shadow-sm',
      ].join(' ')}
    >
      <p className="text-xl font-bold">{title}</p>

      <p
        className={[
          'mt-2 text-sm leading-6',
          isActive ? 'text-blue-100' : 'text-slate-600',
        ].join(' ')}
      >
        {text}
      </p>
    </button>
  )
}