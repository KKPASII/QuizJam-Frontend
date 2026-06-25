<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">퀴즈룸</h1>
      <p class="mt-1 text-sm text-gray-600">내 문제지로 실시간 퀴즈룸을 만들거나 초대 코드로 참여합니다.</p>
    </div>

    <div class="grid gap-6 xl:grid-cols-[1fr_360px]">
      <section class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div class="mb-5 flex items-center justify-between">
          <h2 class="text-lg font-bold text-gray-900">방 만들기</h2>
          <button
            type="button"
            class="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
            @click="fetchQuizzes"
          >
            새로고침
          </button>
        </div>

        <div v-if="loading" class="py-12 text-center text-gray-500">문제지를 불러오는 중...</div>
        <div v-else-if="!quizzes.length" class="rounded-xl border border-dashed border-gray-300 py-12 text-center">
          <p class="font-semibold text-gray-800">사용할 문제지가 없습니다.</p>
          <button
            type="button"
            class="mt-4 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
            @click="router.push('/dashboard/create')"
          >
            문제지 만들기
          </button>
        </div>

        <div v-else class="grid gap-4 md:grid-cols-2">
          <button
            v-for="quiz in quizzes"
            :key="quiz.quizId"
            type="button"
            class="rounded-xl border p-4 text-left transition"
            :class="
              selectedQuizId === quiz.quizId
                ? 'border-green-500 bg-green-50 ring-1 ring-green-500'
                : 'border-gray-200 bg-white hover:border-green-300'
            "
            @click="selectedQuizId = quiz.quizId"
          >
            <div class="mb-3 flex items-center gap-2">
              <span class="rounded-md bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-700">
                {{ quiz.type }}
              </span>
              <span class="text-xs font-medium text-gray-400">{{ quiz.difficulty }}</span>
            </div>
            <h3 class="line-clamp-2 font-bold text-gray-900">{{ quiz.title }}</h3>
            <p class="mt-3 text-sm text-gray-500">{{ quiz.questionCount }}문제</p>
          </button>
        </div>

        <div class="mt-6 flex flex-wrap items-end gap-4 border-t border-gray-100 pt-5">
          <div>
            <label class="mb-2 block text-sm font-semibold text-gray-700">문제당 제한 시간</label>
            <div class="flex items-center gap-2">
              <input
                v-model.number="questionTimeLimitSeconds"
                type="number"
                min="5"
                max="300"
                class="w-28 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              />
              <span class="text-sm font-medium text-gray-500">초</span>
            </div>
          </div>
          <button
            type="button"
            class="rounded-xl bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="!selectedQuizId || creating"
            @click="handleCreateRoom"
          >
            {{ creating ? '생성 중...' : '퀴즈룸 만들기' }}
          </button>
        </div>
      </section>

      <aside class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-bold text-gray-900">초대 코드로 입장</h2>
        <p class="mt-2 text-sm leading-6 text-gray-600">공유받은 코드를 입력하면 닉네임 설정 후 바로 참여할 수 있습니다.</p>
        <form class="mt-5 space-y-3" @submit.prevent="joinByCode">
          <input
            v-model.trim="inviteCode"
            type="text"
            class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 uppercase outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="초대 코드"
          />
          <button type="submit" class="w-full rounded-xl bg-indigo-600 py-3 font-bold text-white hover:bg-indigo-700">
            입장하기
          </button>
        </form>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getMyQuizzes } from '@/api/quiz'
import { createRoom } from '@/api/room'

const router = useRouter()

const quizzes = ref([])
const loading = ref(false)
const creating = ref(false)
const selectedQuizId = ref(null)
const questionTimeLimitSeconds = ref(20)
const inviteCode = ref('')

async function fetchQuizzes() {
  loading.value = true
  try {
    const response = await getMyQuizzes({ page: 0, size: 30 })
    quizzes.value = response.data.content || []
    if (!selectedQuizId.value && quizzes.value.length) {
      selectedQuizId.value = quizzes.value[0].quizId
    }
  } catch (error) {
    console.error('문제지 조회 실패:', error)
    alert('문제지를 불러오지 못했습니다.')
  } finally {
    loading.value = false
  }
}

function rememberHostRoom(roomId) {
  const key = 'quizjam_host_rooms'
  const saved = JSON.parse(localStorage.getItem(key) || '[]')
  const next = Array.from(new Set([...saved, String(roomId)]))
  localStorage.setItem(key, JSON.stringify(next))
}

async function handleCreateRoom() {
  creating.value = true
  try {
    const response = await createRoom({
      quizId: selectedQuizId.value,
      questionTimeLimitSeconds: questionTimeLimitSeconds.value,
    })
    rememberHostRoom(response.data.roomId)
    await router.push({ name: 'room-play', params: { roomId: response.data.roomId } })
  } catch (error) {
    console.error('퀴즈룸 생성 실패:', error)
    alert('퀴즈룸을 만들지 못했습니다.')
  } finally {
    creating.value = false
  }
}

function joinByCode() {
  if (!inviteCode.value) {
    alert('초대 코드를 입력해주세요.')
    return
  }
  router.push({ name: 'room-join', params: { inviteCode: inviteCode.value.toUpperCase() } })
}

onMounted(fetchQuizzes)
</script>
