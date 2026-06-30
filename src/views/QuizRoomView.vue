<template>
  <div class="min-h-screen bg-gray-50 p-6 font-['Inter','Noto_Sans_KR',sans-serif]">
    <div class="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_320px]">
      <main class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div class="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <p class="text-sm font-bold uppercase tracking-wide text-green-700">Quiz Room</p>
            <h1 class="mt-1 text-2xl font-extrabold text-gray-950">
              {{ room ? '초대 코드 ' + room.inviteCode : '퀴즈룸' }}
            </h1>
            <p class="mt-2 text-sm text-gray-600">{{ connectionLabel }}</p>
          </div>

          <div class="flex flex-wrap gap-2">
            <button
              v-if="room"
              type="button"
              class="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              @click="copyInviteLink"
            >
              초대 링크 복사
            </button>
            <button
              v-if="isHost && room?.status === 'WAITING'"
              type="button"
              class="rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-60"
              :disabled="!connected"
              @click="startGame"
            >
              시작하기
            </button>
          </div>
        </div>

        <section v-if="loading" class="flex h-96 items-center justify-center text-gray-500">
          방 정보를 불러오는 중...
        </section>

        <section v-else-if="!room" class="py-20 text-center">
          <h2 class="text-xl font-bold text-gray-900">방을 찾을 수 없습니다.</h2>
          <button
            type="button"
            class="mt-5 rounded-xl bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-700"
            @click="router.push('/dashboard/room')"
          >
            퀴즈룸으로 돌아가기
          </button>
        </section>

        <section v-else-if="!currentQuestion && !rankings.length" class="py-16 text-center">
          <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
            <Users class="h-8 w-8" />
          </div>
          <h2 class="text-2xl font-extrabold text-gray-950">
            {{ room.status === 'WAITING' ? '참가자를 기다리는 중' : '퀴즈 진행을 기다리는 중' }}
          </h2>
          <p class="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-600">
            참가자는 초대 코드로 들어오면 자동으로 대기실에 표시됩니다.
            {{ isHost ? '준비가 되면 시작하기를 눌러주세요.' : '호스트가 퀴즈를 시작하면 문제가 표시됩니다.' }}
          </p>

          <div class="mx-auto mt-8 max-w-sm rounded-xl bg-gray-50 p-4">
            <p class="text-sm font-semibold text-gray-700">초대 코드</p>
            <p class="mt-1 text-3xl font-extrabold tracking-wide text-green-700">{{ room.inviteCode }}</p>
          </div>
        </section>

        <section v-else-if="currentQuestion" class="space-y-6">
          <div class="flex items-center justify-between text-sm font-semibold text-gray-500">
            <span>Question {{ currentQuestion.questionIndex + 1 }} / {{ currentQuestion.questionCount }}</span>
            <span :class="{ 'text-red-600': secondsLeft <= 5 }">남은 시간 {{ secondsLeft }}초</span>
          </div>
          <div class="h-2 overflow-hidden rounded-full bg-gray-100">
            <div class="h-full bg-indigo-600 transition-all" :style="{ width: progressWidth }"></div>
          </div>

          <h2 class="text-2xl font-bold leading-relaxed text-gray-950">
            Q. {{ currentQuestion.questionText }}
          </h2>

          <div v-if="hasCurrentOptions" class="space-y-3">
            <button
              v-for="(text, key) in currentQuestion.options"
              :key="key"
              type="button"
              class="w-full rounded-xl border-2 p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-70"
              :class="
                currentAnswer === key
                  ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                  : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50'
              "
              :disabled="answerSubmitted || !canAnswer"
              @click="draftAnswer = key"
            >
              <span
                class="mr-3 rounded bg-gray-100 px-2 py-1 font-bold"
                :class="currentAnswer === key ? 'bg-indigo-200 text-indigo-800' : 'text-gray-600'"
              >
                {{ key }}
              </span>
              {{ text }}
            </button>
          </div>

          <input
            v-else
            v-model="draftAnswer"
            type="text"
            class="w-full rounded-xl border-2 border-gray-300 p-4 text-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-70"
            placeholder="정답을 입력하세요"
            :disabled="answerSubmitted || !canAnswer"
          />

          <div v-if="currentQuestion.hint" class="rounded-xl bg-yellow-50 p-4 text-sm leading-6 text-yellow-800">
            <strong>힌트:</strong> {{ currentQuestion.hint }}
          </div>

          <div class="flex items-center justify-between border-t border-gray-100 pt-5">
            <p class="text-sm font-medium text-gray-500">
              {{ submittedCount }}명이 답안을 제출했습니다.
            </p>
            <button
              type="button"
              class="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="answerSubmitted || !canAnswer || !String(draftAnswer).trim()"
              @click="submitAnswer"
            >
              {{ answerSubmitted ? '제출 완료' : '답안 제출' }}
            </button>
          </div>
        </section>

        <section v-else class="py-12">
          <h2 class="mb-6 text-2xl font-extrabold text-gray-950">최종 순위</h2>
          <div v-if="!rankings.length" class="rounded-xl bg-gray-50 py-12 text-center text-gray-500">
            결과 집계를 기다리는 중...
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="ranking in rankings"
              :key="ranking.participantId"
              class="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4"
            >
              <div class="flex items-center gap-3">
                <span class="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 font-bold text-green-700">
                  {{ ranking.rank }}
                </span>
                <span class="font-bold text-gray-900">{{ ranking.nickname }}</span>
              </div>
              <span class="font-extrabold text-indigo-700">{{ ranking.score }}점</span>
            </div>
          </div>
        </section>
      </main>

      <aside class="space-y-6">
        <section class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 class="mb-4 text-lg font-bold text-gray-900">참가자</h2>
          <div v-if="!room?.participants?.length" class="text-sm text-gray-500">아직 참가자가 없습니다.</div>
          <div v-else class="space-y-3">
            <div
              v-for="participant in room.participants"
              :key="participant.participantId"
              class="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
            >
              <div class="min-w-0">
                <p class="truncate font-bold text-gray-900">
                  {{ participant.nickname }}
                  <span v-if="participant.host" class="ml-1 text-xs text-green-700">HOST</span>
                </p>
                <p class="text-xs" :class="participant.online ? 'text-green-600' : 'text-gray-400'">
                  {{ participant.online ? '온라인' : '오프라인' }}
                </p>
              </div>
              <span class="text-sm font-bold text-indigo-700">{{ participant.score }}점</span>
            </div>
          </div>
        </section>

        <section class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 class="mb-2 text-lg font-bold text-gray-900">내 상태</h2>
          <p class="text-sm leading-6 text-gray-600">
            {{ isHost ? '호스트 권한으로 방을 시작할 수 있습니다.' : participant ? participant.nickname + '님으로 참여 중입니다.' : '참가 등록을 기다리는 중입니다.' }}
          </p>
          <button
            type="button"
            class="mt-4 w-full rounded-xl border border-gray-200 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            @click="leaveRoom"
          >
            나가기
          </button>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Users } from 'lucide-vue-next'
import { getQuizAnswers } from '@/api/quiz'
import { deleteRoom, getRoom } from '@/api/room'
import { createStompClient, parseMessage } from '@/api/stomp'

const props = defineProps({
  roomId: {
    type: [String, Number],
    required: true,
  },
})

const route = useRoute()
const router = useRouter()
const roomId = String(props.roomId)

const loading = ref(true)
const room = ref(null)
const connected = ref(false)
const participant = ref(null)
const currentQuestion = ref(null)
const questions = ref([])
const answersByIndex = ref({})
const draftAnswer = ref('')
const submittedIndexes = ref(new Set())
const submittedCount = ref(0)
const secondsLeft = ref(0)
const rankings = ref([])
const finalized = ref(false)
let stompClient = null
let countdownTimer = null
let leavingRoom = false

const isHost = computed(() => {
  const saved = JSON.parse(localStorage.getItem('quizjam_host_rooms') || '[]')
  return saved.includes(roomId)
})
const connectionLabel = computed(() => {
  if (!room.value) return '방 정보를 확인하고 있습니다.'
  if (!connected.value) return '실시간 서버에 연결 중입니다.'
  return '실시간 연결됨 · ' + room.value.status
})
const canAnswer = computed(() => Boolean(participant.value && connected.value && currentQuestion.value))
const hasCurrentOptions = computed(() => {
  const options = currentQuestion.value?.options
  return options && Object.keys(options).length > 0
})
const currentAnswer = computed(() => draftAnswer.value)
const answerSubmitted = computed(() => {
  const index = currentQuestion.value?.questionIndex
  return index !== undefined && submittedIndexes.value.has(index)
})
const progressWidth = computed(() => {
  const limit = room.value?.questionTimeLimitSeconds || 20
  const ratio = Math.max(0, Math.min(1, secondsLeft.value / limit))
  return ratio * 100 + '%'
})

function getJoinInfo() {
  if (route.query.inviteCode && route.query.nickname) {
    return {
      inviteCode: String(route.query.inviteCode),
      nickname: String(route.query.nickname),
    }
  }

  try {
    return JSON.parse(sessionStorage.getItem('quizjam_room_' + roomId + '_join') || 'null')
  } catch {
    return null
  }
}

async function loadRoom() {
  loading.value = true
  try {
    const response = await getRoom(roomId)
    room.value = response.data
    syncHostParticipant()
  } catch (error) {
    console.error('방 조회 실패:', error)
    room.value = null
  } finally {
    loading.value = false
  }
}

function connectStomp() {
  stompClient = createStompClient({
    onConnect: () => {
      connected.value = true
      subscribeRoomTopics()
      registerParticipantIfNeeded()
    },
    onDisconnect: () => {
      connected.value = false
    },
    onError: (error) => {
      console.error('STOMP 연결 오류:', error)
      connected.value = false
    },
  })
  stompClient.activate()
}

function subscribeRoomTopics() {
  stompClient.subscribe('/topic/room/' + roomId, (message) => {
    const event = parseMessage(message)
    if (!event) return
    if (event.type === 'ROOM_SNAPSHOT' || event.type === 'ROOM_STARTED') {
      room.value = event.payload
      syncHostParticipant()
    }
  })

  stompClient.subscribe('/topic/quiz/' + roomId, (message) => {
    const event = parseMessage(message)
    if (event) handleQuizEvent(event)
  })

  stompClient.subscribe('/user/queue/room.joined', (message) => {
    const response = parseMessage(message)
    if (!response?.room) return
    participant.value = {
      participantId: response.participantId,
      nickname: response.nickname,
    }
    room.value = response.room
  })
}

function registerParticipantIfNeeded() {
  const joinInfo = getJoinInfo()
  if (isHost.value) {
    syncHostParticipant()
    return
  }
  if (!joinInfo) return

  stompClient.publish({
    destination: '/app/room.join',
    body: JSON.stringify({
      inviteCode: joinInfo.inviteCode,
      nickname: joinInfo.nickname,
    }),
  })
}

function handleQuizEvent(event) {
  if (event.type === 'QUIZ_STARTED') {
    rankings.value = []
    finalized.value = false
    return
  }

  if (event.type === 'QUESTION_OPENED') {
    const question = event.payload
    currentQuestion.value = question
    questions.value[question.questionIndex] = question
    draftAnswer.value = answersByIndex.value[question.questionIndex] || ''
    submittedCount.value = 0
    startCountdown(question.deadlineEpochMs)
    return
  }

  if (event.type === 'ANSWER_SUBMITTED') {
    submittedCount.value = event.payload?.submittedCount || submittedCount.value
    return
  }

  if (event.type === 'QUESTION_CLOSED') {
    stopCountdown()
    currentQuestion.value = null
    draftAnswer.value = ''
    return
  }

  if (event.type === 'QUESTIONS_FINISHED') {
    stopCountdown()
    currentQuestion.value = null
    submitLocalScore()
    return
  }

  if (event.type === 'RESULT_UPDATED' || event.type === 'RESULT_FINALIZED') {
    rankings.value = event.payload?.rankings || []
    finalized.value = Boolean(event.payload?.finalized)
  }
}

function startCountdown(deadlineEpochMs) {
  stopCountdown()
  const tick = () => {
    secondsLeft.value = Math.max(0, Math.ceil((deadlineEpochMs - Date.now()) / 1000))
  }
  tick()
  countdownTimer = setInterval(tick, 250)
}

function stopCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

function startGame() {
  syncHostParticipant()
  stompClient?.publish({
    destination: '/app/room.start',
    body: JSON.stringify({ roomId: Number(roomId) }),
  })
}

function submitAnswer() {
  if (!currentQuestion.value || !String(draftAnswer.value).trim()) return

  const index = currentQuestion.value.questionIndex
  answersByIndex.value[index] = draftAnswer.value
  submittedIndexes.value.add(index)

  stompClient.publish({
    destination: '/app/quiz.submit',
    body: JSON.stringify({
      roomId: Number(roomId),
      questionId: currentQuestion.value.questionId,
      answer: String(draftAnswer.value),
    }),
  })
}

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '')
}

function isCorrect(userAnswer, correctAnswer, hasOptions) {
  if (!String(userAnswer || '').trim()) return false
  if (hasOptions) return userAnswer === correctAnswer
  const user = normalize(userAnswer)
  const correct = normalize(correctAnswer)
  return user === correct || user.includes(correct) || correct.includes(user)
}

async function submitLocalScore() {
  syncHostParticipant()
  if (!participant.value) return

  try {
    const response = await getQuizAnswers(room.value.quizId)
    const correctAnswers = response.data || []
    const score = questions.value.reduce((total, question, index) => {
      const userAnswer = answersByIndex.value[index] || ''
      const correctAnswer = correctAnswers[index]?.answer || ''
      const hasOptions = question?.options && Object.keys(question.options).length > 0
      return total + (isCorrect(userAnswer, correctAnswer, hasOptions) ? 1 : 0)
    }, 0)

    stompClient.publish({
      destination: '/app/quiz.result.submit',
      body: JSON.stringify({ roomId: Number(roomId), score }),
    })
  } catch (error) {
    console.error('점수 제출 실패:', error)
  }
}

async function copyInviteLink() {
  const link = window.location.origin + '/rooms/join/' + room.value.inviteCode
  try {
    await navigator.clipboard.writeText(link)
    alert('초대 링크를 복사했습니다.')
  } catch {
    prompt('초대 링크를 복사하세요.', link)
  }
}

async function leaveRoom() {
  leavingRoom = true
  const host = isHost.value
  try {
    stompClient?.publish({ destination: '/app/room.leave', body: '{}' })
  } catch {
    // Connection may already be closing.
  }
  await deactivateStomp()

  if (host) {
    try {
      await deleteRoom(roomId)
      removeHostRoom()
    } catch (error) {
      console.error('Quiz room deletion failed:', error)
    }
  }

  router.push(host ? '/dashboard/room' : '/')
}

function removeHostRoom() {
  const key = 'quizjam_host_rooms'
  const saved = JSON.parse(localStorage.getItem(key) || '[]')
  localStorage.setItem(key, JSON.stringify(saved.filter((id) => id !== roomId)))
}

function syncHostParticipant() {
  if (!isHost.value || !room.value?.participants?.length) return
  const hostParticipant = room.value.participants.find((item) => item.host)
  if (hostParticipant) {
    participant.value = hostParticipant
  }
}

async function deactivateStomp() {
  try {
    await stompClient?.deactivate()
  } finally {
    connected.value = false
  }
}

onMounted(async () => {
  await loadRoom()
  if (room.value) connectStomp()
})

onUnmounted(() => {
  stopCountdown()
  if (!leavingRoom) {
    try {
      stompClient?.publish({ destination: '/app/room.leave', body: '{}' })
    } catch {
      // ignore
    }
  }
  stompClient?.deactivate()
})
</script>
