const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

type SendChatMessageParams = {
  conversationId: number
  token: string
  text: string
}

type ChatWebSocketResponse = {
  action: string
  conversation_id: number
  data?: {
    id?: number
    message?: string
    sender_id?: number
    created_at?: string
    is_read?: boolean
    msg?: string
  }
}

function getWebSocketBaseUrl() {
  return API_URL.replace(/^http/, 'ws')
}

export function sendChatMessageViaWebSocket({
  conversationId,
  token,
  text,
}: SendChatMessageParams) {
  return new Promise<ChatWebSocketResponse>((resolve, reject) => {
    const encodedToken = encodeURIComponent(token)

    const socketUrl = `${getWebSocketBaseUrl()}/chat/ws/conversation/${conversationId}?token=${encodedToken}`

    const socket = new WebSocket(socketUrl)

    const timeoutId = window.setTimeout(() => {
      socket.close()
      reject(new Error('WebSocket timeout'))
    }, 10000)

    socket.addEventListener('open', () => {
      socket.send(
        JSON.stringify({
          action: 'send',
          conversation_id: conversationId,
          text,
        }),
      )
    })

    socket.addEventListener('message', (event) => {
      try {
        const response = JSON.parse(event.data) as ChatWebSocketResponse

        if (response.action === 'new_message') {
          window.clearTimeout(timeoutId)
          socket.close()
          resolve(response)
          return
        }

        if (response.action === 'error') {
          window.clearTimeout(timeoutId)
          socket.close()
          reject(new Error(response.data?.msg ?? 'WebSocket error'))
        }
      } catch {
        window.clearTimeout(timeoutId)
        socket.close()
        reject(new Error('Invalid WebSocket response'))
      }
    })

    socket.addEventListener('error', () => {
      window.clearTimeout(timeoutId)
      socket.close()
      reject(new Error('WebSocket connection error'))
    })

    socket.addEventListener('close', (event) => {
      if (event.code === 1008) {
        window.clearTimeout(timeoutId)
        reject(new Error(event.reason || 'WebSocket access denied'))
      }
    })
  })
}