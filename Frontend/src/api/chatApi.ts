import { apiClient } from './axiosInstance'
import type { ChatConversation, ChatMessage } from '../types/message'

export async function getCurrentAccessToken() {
  const response = await apiClient.get<{ token: string }>(
    '/auth/token_curr_user',
  )

  return response.data.token
}

function extractConversationId(data: unknown): number {
  if (typeof data === 'number') {
    return data
  }

  if (typeof data === 'string') {
    const parsedNumber = Number(data)

    if (Number.isFinite(parsedNumber)) {
      return parsedNumber
    }

    try {
      const parsedData = JSON.parse(data)
      return extractConversationId(parsedData)
    } catch {
      throw new Error(
        'Backend returned conversation as string, but it is not a number or JSON',
      )
    }
  }

  if (data && typeof data === 'object') {
    const objectData = data as {
      id?: unknown
      conversation_id?: unknown
      conversationId?: unknown
    }

    const possibleId =
      objectData.id ?? objectData.conversation_id ?? objectData.conversationId

    if (typeof possibleId === 'number') {
      return possibleId
    }

    if (typeof possibleId === 'string') {
      const parsedNumber = Number(possibleId)

      if (Number.isFinite(parsedNumber)) {
        return parsedNumber
      }
    }
  }

  throw new Error('Cannot extract conversation id from backend response')
}

export async function getOrCreateConversationByListing(listingId: number) {
  const response = await apiClient.get<unknown>(
    `/chat/conversations/by-listing/${listingId}`,
  )

  return extractConversationId(response.data)
}

export async function getChatConversations() {
  const response = await apiClient.get<ChatConversation[]>('/chat/conversations')

  return response.data
}

export async function getChatConversationMessages(conversationId: number) {
  const response = await apiClient.get<ChatMessage[]>(
    `/chat/conversations/${conversationId}/messages`,
  )

  return response.data
}

export type ChatCurrentUser = {
    id: number
    email: string
  }
  
  export async function getCurrentChatUser() {
    const response = await apiClient.get<ChatCurrentUser>('/auth/me')
  
    return response.data
  }