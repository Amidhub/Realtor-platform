import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiClient } from '../../api/axiosInstance'

const CONTACT_MESSAGES_STORAGE_KEY = 'realtor_platform_contact_messages'

type DeleteAccountSectionProps = {
  userEmail: string
}

type DeleteStatus = 'idle' | 'deleting' | 'deleted' | 'error'

export function DeleteAccountSection({ userEmail }: DeleteAccountSectionProps) {
  const { t } = useTranslation()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteStatus, setDeleteStatus] = useState<DeleteStatus>('idle')

  const handleDeleteAccount = async () => {
    setDeleteStatus('deleting')

    try {
      await apiClient.delete('/user/delete')

      localStorage.removeItem(CONTACT_MESSAGES_STORAGE_KEY)

      setDeleteStatus('deleted')
      setIsModalOpen(false)

      window.setTimeout(() => {
        window.location.href = '/register'
      }, 1200)
    } catch (error) {
      console.error(error)

      setDeleteStatus('error')
    }
  }

  const isDeleting = deleteStatus === 'deleting'

  return (
    <div className="rounded-[30px] border border-rose-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rose-500">
            {t('deleteAccount.badge')}
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-950">
            {t('deleteAccount.title')}
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            {t('deleteAccount.description')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          disabled={isDeleting}
          className="w-fit rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-bold text-rose-700 transition hover:-translate-y-0.5 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDeleting
            ? t('deleteAccount.deletingButton')
            : t('deleteAccount.deleteButton')}
        </button>
      </div>

      <div className="mt-5 rounded-[24px] border border-rose-100 bg-rose-50/70 p-4 text-sm leading-6 text-rose-700">
        {t('deleteAccount.warning')}
      </div>

      {deleteStatus === 'deleted' && (
        <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          {t('deleteAccount.deleted')}
        </div>
      )}

      {deleteStatus === 'error' && (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {t('deleteAccount.error')}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-[30px] bg-white p-6 shadow-2xl"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rose-500">
              {t('deleteAccount.badge')}
            </p>

            <h3 className="mt-2 text-2xl font-bold text-slate-950">
              {t('deleteAccount.confirmTitle')}
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {t('deleteAccount.confirmTextStart')}{' '}
              <span className="font-bold text-slate-950">{userEmail}</span>.{' '}
              {t('deleteAccount.confirmTextEnd')}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="rounded-2xl bg-rose-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:bg-rose-300"
              >
                {isDeleting
                  ? t('deleteAccount.confirmingButton')
                  : t('deleteAccount.confirmButton')}
              </button>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isDeleting}
                className="rounded-2xl border border-[#d9cdb8] bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t('deleteAccount.cancelButton')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}