import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type KeyboardEvent,
  } from 'react'
  import { useMutation, useQuery } from '@tanstack/react-query'
  import { useTranslation } from 'react-i18next'
  import {
    getChatConversationMessages,
    getChatConversations,
    getCurrentAccessToken,
    getCurrentChatUser,
    getOrCreateConversationByListing,
  } from '../../api/chatApi'
  import { sendChatMessageViaWebSocket } from '../../lib/chatSocket'
  import type { ChatConversation, ChatMessage } from '../../types/message'
  
  const OWNER_CHAT_READ_MARKERS_KEY = 'realtor_platform_owner_chat_read_markers'
  
  type ContactOwnerModalProps = {
    isOpen: boolean
    propertyId: number
    propertyTitle: string
    isOwnerView?: boolean
    onClose: () => void
  }
  
  function loadOwnerChatReadMarkers() {
    try {
      const savedMarkers = localStorage.getItem(OWNER_CHAT_READ_MARKERS_KEY)
  
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
  
  function saveOwnerChatReadMarkers(markers: Record<number, string>) {
    localStorage.setItem(OWNER_CHAT_READ_MARKERS_KEY, JSON.stringify(markers))
  }
  
  function getConversationMarker(conversation: ChatConversation) {
    return conversation.latest_message_time ?? conversation.created_at
  }
  
  function formatMessageDate(date: string, locale: string) {
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }
  
  function getBuyerLabel(conversation: ChatConversation, buyerLabel: string) {
    return `${buyerLabel} #${conversation.buyer_id}`
  }
  
  export function ContactOwnerModal({
    isOpen,
    propertyId,
    propertyTitle,
    isOwnerView = false,
    onClose,
  }: ContactOwnerModalProps) {
    const { t, i18n } = useTranslation()
    const locale = i18n.language === 'en' ? 'en-US' : 'ru-RU'
  
    const [replyText, setReplyText] = useState('')
    const [replyError, setReplyError] = useState('')
    const [selectedConversationId, setSelectedConversationId] = useState<
      number | null
    >(null)
  
    const [ownerReadMarkers, setOwnerReadMarkers] = useState<
      Record<number, string>
    >(() => loadOwnerChatReadMarkers())
  
    const messagesContainerRef = useRef<HTMLDivElement | null>(null)
  
    const currentUserQuery = useQuery({
      queryKey: ['chat-current-user'],
      queryFn: getCurrentChatUser,
      enabled: isOpen,
    })
  
    const buyerConversationQuery = useQuery({
      queryKey: ['property-conversation', propertyId],
      queryFn: () => getOrCreateConversationByListing(propertyId),
      enabled: isOpen && !isOwnerView,
    })
  
    const ownerConversationsQuery = useQuery({
      queryKey: ['owner-property-conversations', propertyId],
      queryFn: getChatConversations,
      enabled: isOpen && isOwnerView,
    })
  
    const ownerConversations = useMemo(() => {
      return (ownerConversationsQuery.data ?? []).filter(
        (conversation) => conversation.listing_id === propertyId,
      )
    }, [ownerConversationsQuery.data, propertyId])
  
    const activeConversationId = isOwnerView
      ? selectedConversationId ?? ownerConversations[0]?.id ?? null
      : buyerConversationQuery.data ?? null
  
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
  
    const markOwnerConversationAsRead = (conversation: ChatConversation) => {
      setOwnerReadMarkers((currentMarkers) => {
        const nextMarkers = {
          ...currentMarkers,
          [conversation.id]: getConversationMarker(conversation),
        }
  
        saveOwnerChatReadMarkers(nextMarkers)
  
        return nextMarkers
      })
    }
  
    const getOwnerUnreadCount = (conversation: ChatConversation) => {
      if (conversation.id === activeConversationId) {
        return 0
      }
  
      const currentMarker = getConversationMarker(conversation)
      const savedMarker = ownerReadMarkers[conversation.id]
  
      if (savedMarker === currentMarker) {
        return 0
      }
  
      return conversation.unread_count
    }
  
    const handleClose = () => {
      setReplyText('')
      setReplyError('')
      setSelectedConversationId(null)
      onClose()
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
        const trimmedText = replyText.trim()
  
        if (!activeConversationId || trimmedText.length === 0) {
          return
        }
  
        const token = await getCurrentAccessToken()
  
        await sendChatMessageViaWebSocket({
          conversationId: activeConversationId,
          token,
          text: trimmedText,
        })
      },
      onSuccess: async () => {
        setReplyText('')
        setReplyError('')
  
        await messagesQuery.refetch()
  
        if (isOwnerView) {
          const updatedConversations = await ownerConversationsQuery.refetch()
  
          const updatedConversation = updatedConversations.data?.find(
            (conversation) => conversation.id === activeConversationId,
          )
  
          if (updatedConversation) {
            markOwnerConversationAsRead(updatedConversation)
          }
        } else {
          await buyerConversationQuery.refetch()
        }
      },
      onError: (error) => {
        console.error(error)
  
        setReplyError(t('contactOwnerModal.sendError'))
      },
    })
  
    const handleSendMessage = () => {
      if (replyText.trim() === '') {
        return
      }
  
      setReplyError('')
      sendMessageMutation.mutate()
    }
  
    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        handleSendMessage()
      }
    }
  
    if (!isOpen) {
      return null
    }
  
    const currentUserId = currentUserQuery.data?.id ?? null
  
    const isInitialLoading =
      currentUserQuery.isLoading ||
      buyerConversationQuery.isLoading ||
      ownerConversationsQuery.isLoading
  
    const hasNoOwnerDialogs =
      isOwnerView &&
      !ownerConversationsQuery.isLoading &&
      ownerConversations.length === 0
  
    const modalTitle = isOwnerView
      ? t('contactOwnerModal.ownerTitle')
      : t('contactOwnerModal.title')
  
    const buyerLabel = t('contactOwnerModal.buyerLabel')
    const ownerLabel = t('contactOwnerModal.ownerLabel')
  
    const interlocutorLabel = isOwnerView ? buyerLabel : ownerLabel
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
        <div
          role="dialog"
          aria-modal="true"
          className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-[30px] bg-white shadow-2xl"
        >
          <div className="shrink-0 border-b border-[#e2d6c3] bg-white px-5 py-4 sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-2xl font-bold text-slate-950">
                  {modalTitle}
                </h2>
  
                <p className="mt-1 truncate text-sm text-slate-500">
                  {propertyTitle}
                </p>
              </div>
  
              <button
                type="button"
                onClick={handleClose}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#f7f2e8] text-xl font-bold text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
                aria-label={t('common.close')}
              >
                ×
              </button>
            </div>
          </div>
  
          <div className="min-h-0 flex flex-1 overflow-hidden">
            {isOwnerView && (
              <aside className="hidden w-[300px] shrink-0 border-r border-[#e2d6c3] bg-[#fbfaf7] p-4 md:block">
                <div className="mb-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
                    {t('contactOwnerModal.dialogsList')}
                  </p>
  
                  <p className="mt-1 text-sm text-slate-500">
                    {t('contactOwnerModal.selectBuyer')}
                  </p>
                </div>
  
                {ownerConversationsQuery.isLoading && (
                  <div className="rounded-2xl bg-white p-4 text-sm text-slate-600 shadow-sm">
                    {t('contactOwnerModal.loadingDialogs')}
                  </div>
                )}
  
                {hasNoOwnerDialogs && (
                  <div className="rounded-2xl bg-white p-4 text-sm leading-6 text-slate-600 shadow-sm">
                    {t('contactOwnerModal.noOwnerDialogs')}
                  </div>
                )}
  
                <div className="max-h-[calc(88vh-150px)] space-y-3 overflow-y-auto pr-1">
                  {ownerConversations.map((conversation) => {
                    const isSelected = conversation.id === activeConversationId
                    const unreadCount = getOwnerUnreadCount(conversation)
  
                    return (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() => {
                          setSelectedConversationId(conversation.id)
                          setReplyError('')
                          setReplyText('')
                          markOwnerConversationAsRead(conversation)
                        }}
                        className={[
                          'w-full rounded-[22px] border p-4 text-left transition',
                          isSelected
                            ? 'border-blue-300 bg-white shadow-md'
                            : 'border-transparent bg-white/70 hover:border-blue-200 hover:bg-white hover:shadow-sm',
                        ].join(' ')}
                      >
                        <p className="text-sm font-bold text-slate-950">
                          {getBuyerLabel(conversation, buyerLabel)}
                        </p>
  
                        <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-600">
                          {conversation.latest_message ||
                            t('contactOwnerModal.noMessages')}
                        </p>
  
                        {unreadCount > 0 && (
                          <span className="mt-3 inline-flex rounded-full bg-blue-600 px-2.5 py-1 text-xs font-bold text-white">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </aside>
            )}
  
            <div className="min-w-0 flex flex-1 flex-col bg-[#f7f2e8]">
              {isOwnerView && ownerConversations.length > 0 && (
                <div className="block shrink-0 border-b border-[#e2d6c3] bg-white px-4 py-3 md:hidden">
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {ownerConversations.map((conversation) => {
                      const isSelected = conversation.id === activeConversationId
                      const unreadCount = getOwnerUnreadCount(conversation)
  
                      return (
                        <button
                          key={conversation.id}
                          type="button"
                          onClick={() => {
                            setSelectedConversationId(conversation.id)
                            setReplyError('')
                            setReplyText('')
                            markOwnerConversationAsRead(conversation)
                          }}
                          className={[
                            'shrink-0 rounded-2xl px-4 py-2 text-sm font-bold transition',
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-[#f7f2e8] text-slate-700',
                          ].join(' ')}
                        >
                          #{conversation.buyer_id}
                          {unreadCount > 0 && ` · ${unreadCount}`}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
  
              <div
                ref={messagesContainerRef}
                className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6"
              >
                {isInitialLoading && (
                  <div className="rounded-2xl bg-white p-4 text-sm text-slate-600 shadow-sm">
                    {t('contactOwnerModal.loadingChat')}
                  </div>
                )}
  
                {(buyerConversationQuery.isError ||
                  ownerConversationsQuery.isError ||
                  messagesQuery.isError) && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                    {t('contactOwnerModal.loadChatError')}
                  </div>
                )}
  
                {hasNoOwnerDialogs && (
                  <div className="rounded-2xl bg-white p-4 text-sm text-slate-600 shadow-sm">
                    {t('contactOwnerModal.noOwnerDialogs')}
                  </div>
                )}
  
                {!isInitialLoading &&
                  !messagesQuery.isError &&
                  activeConversationId &&
                  messages.length === 0 && (
                    <div className="rounded-2xl bg-white p-4 text-sm text-slate-600 shadow-sm">
                      {t('contactOwnerModal.emptyChat')}
                    </div>
                  )}
  
                {messages.map((message) => {
                  const isOwnMessage =
                    currentUserId !== null && message.sender_id === currentUserId
  
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
                              isOwnMessage ? 'text-blue-100' : 'text-slate-500',
                            ].join(' ')}
                          >
                            {isOwnMessage
                              ? t('contactOwnerModal.me')
                              : interlocutorLabel}
                          </p>
  
                          <p
                            className={[
                              'text-xs',
                              isOwnMessage ? 'text-blue-100' : 'text-slate-400',
                            ].join(' ')}
                          >
                            {formatMessageDate(message.created_at, locale)}
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
                {replyError && (
                  <div className="mb-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                    {replyError}
                  </div>
                )}
  
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <textarea
                    value={replyText}
                    onChange={(event) => setReplyText(event.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={2}
                    disabled={
                      sendMessageMutation.isPending ||
                      !activeConversationId ||
                      hasNoOwnerDialogs
                    }
                    className="min-h-[58px] flex-1 resize-none rounded-2xl border border-[#d9cdb8] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                    placeholder={t('contactOwnerModal.replyPlaceholder')}
                  />
  
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={
                      sendMessageMutation.isPending ||
                      replyText.trim() === '' ||
                      !activeConversationId ||
                      hasNoOwnerDialogs
                    }
                    className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                  >
                    {sendMessageMutation.isPending
                      ? t('contactOwnerModal.sending')
                      : t('contactOwnerModal.send')}
                  </button>
                </div>
  
                <p className="mt-2 text-xs text-slate-400">
                  {t('contactOwnerModal.enterHint')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }