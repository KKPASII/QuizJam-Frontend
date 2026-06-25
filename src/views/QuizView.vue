<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 p-6">
    <div class="w-full max-w-3xl rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
      <div v-if="loading" class="flex h-96 flex-col items-center justify-center gap-4">
        <div class="h-12 w-12 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600"></div>
        <p class="font-medium text-gray-500">문제를 불러오는 중...</p>
      </div>

      <div v-else-if="questions.length === 0" class="py-20 text-center text-gray-500">
        등록된 문제가 없습니다.
      </div>

      <div v-else>
        <div class="mb-2 flex justify-between text-sm font-semibold text-gray-500">
          <span>Question {{ currentIndex + 1 }} / {{ questions.length }}</span>
          <span :class="{ 'animate-pulse text-red-600': timeLeft < 60 }">
            남은 시간 {{ formattedTime }}
          </span>
        </div>

        <div class="mb-8 h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            class="h-full bg-indigo-600 transition-all"
            :style="{ width: ((currentIndex + 1) / questions.length) * 100 + '%' }"
          ></div>
        </div>

        <h1 class="mb-8 text-2xl font-bold leading-relaxed text-gray-900">
          Q. {{ currentQuestion.questionText }}
        </h1>

        <div v-if="hasOptions" class="space-y-3">
          <button
            v-for="(text, key) in currentQuestion.options"
            :key="key"
            type="button"
            class="w-full rounded-xl border-2 p-4 text-left transition"
            :class="
              selectedAnswer === key
                ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50'
            "
            @click="selectAnswer(key)"
          >
            <span
              class="mr-3 rounded bg-gray-100 px-2 py-1 font-bold"
              :class="selectedAnswer === key ? 'bg-indigo-200 text-indigo-800' : 'text-gray-600'"
            >
              {{ key }}
            </span>
            {{ text }}
          </button>
        </div>

        <div v-else>
          <input
            v-model="subjectiveAnswer"
            type="text"
            class="w-full rounded-xl border-2 border-gray-300 p-4 text-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            placeholder="정답을 입력하세요"
            @input="saveSubjectiveAnswer"
          />
        </div>

        <div v-if="currentQuestion.hint" class="mt-6">
          <button
            type="button"
            class="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            @click="showHint[currentIndex] = !showHint[currentIndex]"
          >
            {{ showHint[currentIndex] ? '힌트 숨기기' : '힌트 보기' }}
          </button>
          <div v-if="showHint[currentIndex]" class="mt-3 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
            {{ currentQuestion.hint }}
          </div>
        </div>

        <div class="mt-10 flex justify-between border-t border-gray-200 pt-6">
          <button
            type="button"
            class="rounded-lg px-5 py-2 font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            :disabled="currentIndex === 0"
            @click="moveQuestion(-1)"
          >
            이전 문제
          </button>

          <button
            v-if="currentIndex < questions.length - 1"
            type="button"
            class="rounded-xl bg-indigo-600 px-8 py-3 font-bold text-white shadow-md hover:bg-indigo-700"
            @click="moveQuestion(1)"
          >
            다음 문제
          </button>
          <button
            v-else
            type="button"
            class="rounded-xl bg-red-500 px-8 py-3 font-bold text-white shadow-md hover:bg-red-600"
            @click="submitQuiz"
          >
            제출하기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getQuizById, getQuizQuestions } from '@/api/quiz'

const router = useRouter()
const route = useRoute()
const quizId = route.params.id

const questions = ref([])
const loading = ref(true)
const currentIndex = ref(0)
const userAnswers = ref([])
const subjectiveAnswer = ref('')
const showHint = ref([])
const timeLeft = ref(0)
const isSubmitting = ref(false)
let timerInterval = null

const currentQuestion = computed(() => questions.value[currentIndex.value] || {})
const hasOptions = computed(() => {
  const options = currentQuestion.value.options
  return options && Object.keys(options).length > 0
})
const selectedAnswer = computed(() => userAnswers.value[currentIndex.value] || '')
const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60)
  const seconds = timeLeft.value % 60
  return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0')
})

async function loadData() {
  try {
    const [quizResponse, questionResponse] = await Promise.all([
      getQuizById(quizId),
      getQuizQuestions(quizId),
    ])

    timeLeft.value = (quizResponse.data.timeLimitMin || 3) * 60
    questions.value = questionResponse.data || []
    showHint.value = Array(questions.value.length).fill(false)
    startTimer()
  } catch (error) {
    console.error('퀴즈 조회 실패:', error)
    alert('퀴즈를 불러오지 못했습니다.')
    router.replace('/dashboard/my')
  } finally {
    loading.value = false
  }
}

function startTimer() {
  clearTimer()
  timerInterval = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value -= 1
      return
    }
    clearTimer()
    goToResultPage()
  }, 1000)
}

function clearTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

function selectAnswer(answer) {
  userAnswers.value[currentIndex.value] = answer
}

function saveSubjectiveAnswer() {
  userAnswers.value[currentIndex.value] = subjectiveAnswer.value
}

function moveQuestion(offset) {
  const nextIndex = currentIndex.value + offset
  if (nextIndex < 0 || nextIndex >= questions.value.length) return
  currentIndex.value = nextIndex
  subjectiveAnswer.value = userAnswers.value[currentIndex.value] || ''
}

function allAnswered() {
  return questions.value.every((_, index) => String(userAnswers.value[index] || '').trim())
}

function submitQuiz() {
  if (!allAnswered() && !confirm('아직 답하지 않은 문제가 있습니다. 제출할까요?')) return
  goToResultPage()
}

function goToResultPage() {
  if (isSubmitting.value) return
  isSubmitting.value = true
  clearTimer()
  sessionStorage.setItem('quiz_' + quizId + '_answers', JSON.stringify(userAnswers.value))
  router.push({ name: 'quiz-result', params: { id: quizId } })
}

onMounted(loadData)
onUnmounted(clearTimer)
</script>
