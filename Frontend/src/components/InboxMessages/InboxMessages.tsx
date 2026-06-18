import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../app/AuthContext'
import {
  getChatConversationMessages,
  getChatConversations,
  getCurrentAccessToken,
  getCurrentChatUser,
} from '../../api/chatApi'
import { sendChatMessageViaWebSocket } from '../../lib/chatSocket'
import type { ChatConversation, ChatMessage } from '../../types/message'

const INBOX_READ_MARKERS_KEY_PREFIX = 'realtor_platform_inbox_read_markers'

function getInboxReadMarkersKey(userKey: string) {
  return `${INBOX_READ_MARKERS_KEY_PREFIX}_${userKey}`
}

function loadInboxReadMarkers(userKey: string) {
  try {
    const savedMarkers = localStorage.getItem(getInboxReadMarkersKey(userKey))

    if (!savedMarkers) {
      return {}
    }

    const parsedMarkers = JSON.parse(savedMarkers)

    if (!parsedMarkers || typeof parsedMarkers !== 'object') {
      return {}
    }

    return parsedMarkers as Record<number, string>
  } catch {
    return {}
  }
}

function saveInboxReadMarkers(
  userKey: string,
  markers: Record<number, string>,
) {
  localStorage.setItem(getInboxReadMarkersKey(userKey), JSON.stringify(markers))
}

function getConversationMarker(conversation: ChatConversation) {
  return [
    conversation.latest_message_time ?? '',
    conversation.latest_message ?? '',
    conversation.created_at,
  ].join('|')
}

function formatMessageDate(date: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

function getDialogTitle(conversation: ChatConversation) {
  return `#${conversation.id}`
}

function getListingTitle(conversation: ChatConversation) {
  return `#${conversation.listing_id}`
}

export function InboxMessages() {
  const { t } = useTranslation()
  const { user } = useAuth()

  const userKey = user?.email ?? 'guest'

  const [isOpen, setIsOpen] = useState(false)
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | null
  >(null)
  const [messageText, setMessageText] = useState('')
  const [sendError, setSendError] = useState('')

  const [readMarkersByUser, setReadMarkersByUser] = useState<
    Record<string, Record<number, string>>
  >(() => ({
    [userKey]: loadInboxReadMarkers(userKey),
  }))

  const readMarkers =
    readMarkersByUser[userKey] ?? loadInboxReadMarkers(userKey)

  const messagesContainerRef = useRef<HTMLDivElement | null>(null)

  const currentUserQuery = useQuery({
    queryKey: ['chat-current-user'],
    queryFn: getCurrentChatUser,
    enabled: isOpen,
  })

  const conversationsQuery = useQuery({
    queryKey: ['chat-conversations'],
    queryFn: getChatConversations,
    enabled: true,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: isOpen ? false : 5000,
  })

  const conversations = useMemo(() => {
    return [...(conversationsQuery.data ?? [])].sort((first, second) => {
      const firstDate = first.latest_message_time ?? first.created_at
      const secondDate = second.latest_message_time ?? second.created_at

      return new Date(secondDate).getTime() - new Date(firstDate).getTime()
    })
  }, [conversationsQuery.data])

  const activeConversationId = selectedConversationId

  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeConversationId,
  )

  const messagesQuery = useQuery<ChatMessage[]>({
    queryKey: ['chat-conversation-messages', activeConversationId],
    queryFn: async () => {
      if (!activeConversationId) {
        return []
      }

      return getChatConversationMessages(activeConversationId)
    },
    enabled: isOpen && Boolean(activeConversationId),
  })

  const messages = useMemo(() => {
    return [...(messagesQuery.data ?? [])].sort(
      (firstMessage, secondMessage) =>
        new Date(firstMessage.created_at).getTime() -
        new Date(secondMessage.created_at).getTime(),
    )
  }, [messagesQuery.data])

  const markConversationAsRead = (conversation: ChatConversation) => {
    setReadMarkersByUser((currentMarkersByUser) => {
      const currentUserMarkers =
        currentMarkersByUser[userKey] ?? loadInboxReadMarkers(userKey)

      const nextUserMarkers = {
        ...currentUserMarkers,
        [conversation.id]: getConversationMarker(conversation),
      }

      saveInboxReadMarkers(userKey, nextUserMarkers)

      return {
        ...currentMarkersByUser,
        [userKey]: nextUserMarkers,
      }
    })
  }

  const getUnreadCount = (conversation: ChatConversation) => {
    const savedMarker = readMarkers[conversation.id]
    const currentMarker = getConversationMarker(conversation)
  
    if (savedMarker === currentMarker) {
      return 0
    }
  
    if (conversation.latest_message) {
      return 1
    }
  
    return 0
  }

  const totalUnreadCount = conversations.reduce(
    (sum, conversation) => sum + getUnreadCount(conversation),
    0,
  )

  const handleOpenDialogs = () => {
    setIsOpen(true)
    setSendError('')
    void conversationsQuery.refetch()
  }

  const handleCloseDialogs = () => {
    setIsOpen(false)
    setSelectedConversationId(null)
    setMessageText('')
    setSendError('')
    void conversationsQuery.refetch()
  }

  const handleSelectConversation = (conversation: ChatConversation) => {
    setSelectedConversationId(conversation.id)
    setMessageText('')
    setSendError('')
    markConversationAsRead(conversation)
  }

  useEffect(() => {
    const container = messagesContainerRef.current

    if (!container) {
      return
    }

    container.scrollTop = container.scrollHeight
  }, [messages.length, activeConversationId])

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      const trimmedMessage = messageText.trim()

      if (!activeConversationId || trimmedMessage.length === 0) {
        return
      }

      const token = await getCurrentAccessToken()

      await sendChatMessageViaWebSocket({
        conversationId: activeConversationId,
        token,
        text: trimmedMessage,
      })
    },
    onSuccess: async () => {
      setMessageText('')
      setSendError('')

      await messagesQuery.refetch()

      const updatedConversations = await conversationsQuery.refetch()

      const updatedConversation = updatedConversations.data?.find(
        (conversation) => conversation.id === activeConversationId,
      )

      if (updatedConversation) {
        markConversationAsRead(updatedConversation)
      }
    },
    onError: (error) => {
      console.error(error)

      setSendError(
        t('inboxMessages.sendError', {
          defaultValue: 'Не удалось отправить сообщение. Попробуйте ещё раз.',
        }),
      )
    },
  })

  const handleSendMessage = () => {
    if (messageText.trim() === '') {
      return
    }

    setSendError('')
    sendMessageMutation.mutate()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }

  const currentUserId = currentUserQuery.data?.id ?? null

  return (
    <>
      <section className="rounded-[32px] border border-[#e2d6c3] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">
              {t('inboxMessages.badge')}
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-950">
              {t('inboxMessages.title')}
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {t('inboxMessages.subtitle')}
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={handleOpenDialogs}
                className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20"
              >
                {t('inboxMessages.openDialogs')}
              </button>

              <button
                type="button"
                onClick={() => conversationsQuery.refetch()}
                disabled={conversationsQuery.isFetching}
                className="rounded-2xl border border-[#d9cdb8] bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {conversationsQuery.isFetching
                  ? t('inboxMessages.refreshing')
                  : t('inboxMessages.refresh')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-[220px]">
            <div className="rounded-[24px] bg-[#f7f2e8] p-5">
              <p className="text-sm text-slate-500">
                {t('inboxMessages.total')}
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-950">
                {conversations.length}
              </p>
            </div>

            <div className="rounded-[24px] bg-blue-50 p-5">
              <p className="text-sm text-blue-600">
                {t('inboxMessages.new')}
              </p>

              <p className="mt-2 text-3xl font-bold text-blue-600">
                {totalUnreadCount}
              </p>
            </div>
          </div>
        </div>
      </section>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
          <div className="flex max-h-[88vh] w-full max-w-6xl overflow-hidden rounded-[30px] bg-white shadow-2xl">
            <aside className="hidden w-[320px] shrink-0 border-r border-[#e2d6c3] bg-white p-4 md:block">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">
                    {t('inboxMessages.chats')}
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-slate-950">
                    {t('inboxMessages.title')}
                  </h2>
                </div>

                {totalUnreadCount > 0 && (
                  <span className="rounded-full bg-blue-600 px-3 py-1 text-sm font-bold text-white shadow-sm">
                    {totalUnreadCount}
                  </span>
                )}
              </div>

              {conversationsQuery.isLoading && (
                <div className="rounded-2xl bg-[#f7f2e8] p-4 text-sm text-slate-600">
                  {t('inboxMessages.loadingDialogs')}
                </div>
              )}

              {conversationsQuery.isError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                  {t('inboxMessages.dialogsError')}
                </div>
              )}

              {!conversationsQuery.isLoading &&
                !conversationsQuery.isError &&
                conversations.length === 0 && (
                  <div className="rounded-2xl bg-[#f7f2e8] p-4 text-sm text-slate-600">
                    {t('inboxMessages.emptyDialogs')}
                  </div>
                )}

              <div className="max-h-[calc(88vh-130px)] space-y-3 overflow-y-auto pr-1">
                {conversations.map((conversation) => {
                  const isSelected = conversation.id === activeConversationId
                  const unreadCount = getUnreadCount(conversation)

                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => handleSelectConversation(conversation)}
                      className={[
                        'w-full rounded-[24px] border p-4 text-left transition',
                        isSelected
                          ? 'border-blue-300 bg-blue-50 shadow-sm'
                          : 'border-transparent bg-[#fbfaf7] hover:border-blue-200 hover:bg-white hover:shadow-sm',
                      ].join(' ')}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={[
                            'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold',
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-950 text-white',
                          ].join(' ')}
                        >
                          {conversation.id}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-bold text-slate-950">
                                {t('inboxMessages.dialogLabel', {
                                  defaultValue: 'Диалог',
                                })}{' '}
                                {getDialogTitle(conversation)}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {t('inboxMessages.listingLabel', {
                                  defaultValue: 'Объявление',
                                })}{' '}
                                {getListingTitle(conversation)}
                              </p>
                            </div>

                            {unreadCount > 0 && (
                              <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
                                {unreadCount}
                              </span>
                            )}
                          </div>

                          <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                            {conversation.latest_message ||
                              t('inboxMessages.noMessages')}
                          </p>

                          <p className="mt-3 text-xs text-slate-400">
                            {formatMessageDate(
                              conversation.latest_message_time ??
                                conversation.created_at,
                            )}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </aside>

            <div className="min-w-0 flex flex-1 flex-col bg-[#f7f2e8]">
              <header className="shrink-0 border-b border-[#e2d6c3] bg-white px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="truncate text-2xl font-bold text-slate-950">
                      {activeConversation
                        ? `${t('inboxMessages.dialogLabel', {
                            defaultValue: 'Диалог',
                          })} ${getDialogTitle(activeConversation)}`
                        : t('inboxMessages.selectDialog')}
                    </h3>

                    {activeConversation && (
                      <p className="mt-1 text-sm text-slate-500">
                        {t('inboxMessages.listingLabel', {
                          defaultValue: 'Объявление',
                        })}{' '}
                        {getListingTitle(activeConversation)}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleCloseDialogs}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#f7f2e8] text-xl font-bold text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
                    aria-label={t('common.close')}
                  >
                    ×
                  </button>
                </div>
              </header>

              <div className="block shrink-0 border-b border-[#e2d6c3] bg-white px-4 py-3 md:hidden">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {conversations.map((conversation) => {
                    const isSelected = conversation.id === activeConversationId
                    const unreadCount = getUnreadCount(conversation)

                    return (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() => handleSelectConversation(conversation)}
                        className={[
                          'shrink-0 rounded-2xl px-4 py-2 text-sm font-bold transition',
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-[#f7f2e8] text-slate-700',
                        ].join(' ')}
                      >
                        #{conversation.id}
                        {unreadCount > 0 && ` · ${unreadCount}`}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div
                ref={messagesContainerRef}
                className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6"
              >
                {!activeConversationId && (
                  <div className="rounded-2xl bg-white p-5 text-sm leading-6 text-slate-600 shadow-sm">
                    <p className="font-bold text-slate-950">
                      {t('inboxMessages.selectDialog')}
                    </p>

                    <p className="mt-2">
                      {t('inboxMessages.selectDialogText')}
                    </p>
                  </div>
                )}

                {messagesQuery.isLoading && (
                  <div className="rounded-2xl bg-white p-5 text-sm text-slate-600 shadow-sm">
                    {t('inboxMessages.loadingMessages')}
                  </div>
                )}

                {messagesQuery.isError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
                    {t('inboxMessages.messagesError')}
                  </div>
                )}

                {activeConversationId &&
                  !messagesQuery.isLoading &&
                  !messagesQuery.isError &&
                  messages.length === 0 && (
                    <div className="rounded-2xl bg-white p-5 text-sm text-slate-600 shadow-sm">
                      {t('inboxMessages.emptyMessages')}
                    </div>
                  )}

                {messages.map((message) => {
                  const isOwnMessage =
                    currentUserId !== null &&
                    message.sender_id === currentUserId

                  return (
                    <article
                      key={message.id}
                      className={[
                        'flex',
                        isOwnMessage ? 'justify-end' : 'justify-start',
                      ].join(' ')}
                    >
                      <div
                        className={[
                          'max-w-[82%] rounded-[24px] px-4 py-3 shadow-sm',
                          isOwnMessage
                            ? 'rounded-br-md bg-blue-600 text-white'
                            : 'rounded-bl-md bg-white text-slate-900',
                        ].join(' ')}
                      >
                        <div className="mb-2 flex flex-wrap gap-x-3 gap-y-1">
                          <p
                            className={[
                              'text-xs font-bold',
                              isOwnMessage
                                ? 'text-blue-100'
                                : 'text-slate-500',
                            ].join(' ')}
                          >
                            {isOwnMessage
                              ? t('inboxMessages.me')
                              : t('inboxMessages.interlocutor')}
                          </p>

                          <p
                            className={[
                              'text-xs',
                              isOwnMessage
                                ? 'text-blue-100'
                                : 'text-slate-400',
                            ].join(' ')}
                          >
                            {formatMessageDate(message.created_at)}
                          </p>
                        </div>

                        <p className="whitespace-pre-line break-words text-sm leading-6 [overflow-wrap:anywhere]">
                          {message.message}
                        </p>
                      </div>
                    </article>
                  )
                })}
              </div>

              <div className="shrink-0 border-t border-[#e2d6c3] bg-white p-4">
                {sendError && (
                  <div className="mb-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                    {sendError}
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <textarea
                    value={messageText}
                    onChange={(event) => setMessageText(event.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={2}
                    disabled={
                      sendMessageMutation.isPending || !activeConversationId
                    }
                    className="min-h-[58px] flex-1 resize-none rounded-2xl border border-[#d9cdb8] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                    placeholder={t('inboxMessages.placeholder')}
                  />

                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={
                      sendMessageMutation.isPending ||
                      messageText.trim() === '' ||
                      !activeConversationId
                    }
                    className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                  >
                    {sendMessageMutation.isPending
                      ? t('inboxMessages.sending')
                      : t('inboxMessages.send')}
                  </button>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  {t('inboxMessages.enterHint')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}