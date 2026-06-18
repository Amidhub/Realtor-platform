export type ContactMessageStatus = 'new' | 'read'

export type ContactMessage = {
  id: string
  propertyId: number
  propertyTitle: string
  senderName: string
  senderEmail: string
  text: string
  createdAt: string
  status: ContactMessageStatus
}

export type NewContactMessage = Omit<
  ContactMessage,
  'id' | 'createdAt' | 'status'
>

export type ChatConversation = {
  id: number
  listing_id: number
  owner_id: number
  buyer_id: number
  latest_message: string | null
  latest_message_time: string | null
  created_at: string
  unread_count: number
}

export type ChatMessage = {
  id: number
  conversation_id: number
  sender_id: number
  message: string
  is_read: boolean
  created_at: string
}