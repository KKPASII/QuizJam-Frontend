<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 p-6">
    <div class="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-7 shadow-lg">
      <button
        type="button"
        class="mb-6 text-sm font-semibold text-gray-500 hover:text-green-700"
        @click="router.push('/')"
      >
        QuizJam
      </button>

      <h1 class="text-2xl font-extrabold text-gray-950">퀴즈룸 입장</h1>
      <p class="mt-2 text-sm leading-6 text-gray-600">초대 코드와 닉네임을 입력하면 실시간 퀴즈에 참여합니다.</p>

      <div v-if="room" class="mt-5 rounded-2xl border border-green-100 bg-green-50 p-5 text-sm text-green-900">
        <div class="flex items-center justify-between gap-3">
          <p class="font-bold">방을 찾았습니다.</p>
          <span class="rounded-full bg-white px-3 py-1 text-xs font-bold text-green-700 shadow-sm">
            참가자 {{ room.participants?.length || 0 }}명
          </span>
        </div>
        <div class="mt-4 rounded-xl bg-white p-4 shadow-sm">
          <p class="text-lg font-extrabold text-gray-950">{{ room.quizTitle }}</p>
          <p class="mt-1 text-sm font-semibold text-gray-600">
            총 {{ room.questionCount }}문제 · 문제 당 {{ room.questionTimeLimitSeconds }}초
          </p>
        </div>
      </div>

      <form class="mt-6 space-y-4" @submit.prevent="enterRoom">
        <div>
          <label class="mb-2 block text-sm font-semibold text-gray-700">초대 코드</label>
          <input
            v-model.trim="code"
            type="text"
            class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 uppercase outline-none focus:ring-2 focus:ring-green-500"
            placeholder="예: ABCD2345"
          />
        </div>
        <div>
          <label class="mb-2 block text-sm font-semibold text-gray-700">닉네임</label>
          <input
            v-model.trim="nickname"
            type="text"
            maxlength="50"
            class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
            placeholder="표시할 이름"
          />
        </div>
        <button
          type="submit"
          class="w-full rounded-xl bg-green-600 py-3 font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="loading"
        >
          {{ loading ? '확인 중...' : '입장하기' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getRoomByInviteCode } from '@/api/room'
import { createStompClient, parseMessage } from '@/api/stomp'

const props = defineProps({
  inviteCode: {
    type: String,
    default: '',
  },
})

const router = useRouter()
const code = ref(props.inviteCode || '')
const nickname = ref('')
const room = ref(null)
const loading = ref(false)
let stompClient = null
let subscribedRoomId = null

async function lookupRoom() {
  if (!code.value) return
  loading.value = true
  try {
    const response = await getRoomByInviteCode(code.value.toUpperCase())
    room.value = response.data
    connectRoomUpdates(room.value.roomId)
  } catch {
    room.value = null
    disconnectRoomUpdates()
  } finally {
    loading.value = false
  }
}

function connectRoomUpdates(roomId) {
  if (subscribedRoomId === roomId && stompClient?.active) return

  disconnectRoomUpdates()
  subscribedRoomId = roomId
  stompClient = createStompClient({
    onConnect: () => {
      stompClient.subscribe('/topic/room/' + roomId, (message) => {
        const event = parseMessage(message)
        if (!event) return
        if (event.type === 'ROOM_SNAPSHOT' || event.type === 'ROOM_STARTED') {
          room.value = event.payload
        }
        if (event.type === 'ROOM_CLOSED') {
          room.value = null
          disconnectRoomUpdates()
        }
      })
    },
    onError: (error) => {
      console.error('Room update connection failed:', error)
    },
  })
  stompClient.activate()
}

function disconnectRoomUpdates() {
  subscribedRoomId = null
  stompClient?.deactivate()
  stompClient = null
}

async function enterRoom() {
  const inviteCode = code.value.toUpperCase()
  if (!inviteCode) {
    alert('초대 코드를 입력해주세요.')
    return
  }
  if (!nickname.value) {
    alert('닉네임을 입력해주세요.')
    return
  }

  if (!room.value || room.value.inviteCode !== inviteCode) {
    await lookupRoom()
  }
  if (!room.value) {
    alert('퀴즈룸을 찾을 수 없습니다.')
    return
  }

  sessionStorage.setItem(
    'quizjam_room_' + room.value.roomId + '_join',
    JSON.stringify({ inviteCode, nickname: nickname.value }),
  )

  router.push({
    name: 'room-play',
    params: { roomId: room.value.roomId },
    query: { inviteCode, nickname: nickname.value },
  })
}

watch(code, () => {
  room.value = null
  disconnectRoomUpdates()
})

onMounted(lookupRoom)

onUnmounted(disconnectRoomUpdates)
</script>
