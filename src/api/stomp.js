import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client/dist/sockjs'

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || 'http://localhost:8081'

export function createStompClient({ onConnect, onDisconnect, onError } = {}) {
  return new Client({
    reconnectDelay: 3000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    webSocketFactory: () => new SockJS(API_ORIGIN + '/ws'),
    onConnect,
    onDisconnect,
    onStompError: onError,
    onWebSocketError: onError,
  })
}

export function parseMessage(message) {
  if (!message?.body) return null
  try {
    return JSON.parse(message.body)
  } catch {
    return null
  }
}
