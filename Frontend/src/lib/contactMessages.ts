import type { ContactMessage, NewContactMessage } from '../types/message'

const CONTACT_MESSAGES_STORAGE_KEY = 'realtor_platform_contact_messages'

function createMessageId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function getContactMessages(): ContactMessage[] {
  const savedMessages = localStorage.getItem(CONTACT_MESSAGES_STORAGE_KEY)

  if (!savedMessages) {
    return []
  }

  try {
    const parsedMessages = JSON.parse(savedMessages)

    if (!Array.isArray(parsedMessages)) {
      return []
    }

    return parsedMessages as ContactMessage[]
  } catch {
    return []
  }
}

export function saveContactMessage(message: NewContactMessage) {
  const currentMessages = getContactMessages()

  const newMessage: ContactMessage = {
    ...message,
    id: createMessageId(),
    createdAt: new Date().toISOString(),
    status: 'new',
  }

  localStorage.setItem(
    CONTACT_MESSAGES_STORAGE_KEY,
    JSON.stringify([newMessage, ...currentMessages]),
  )

  return newMessage
}