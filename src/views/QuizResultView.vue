<template>
  <div class="flex min-h-screen justify-center bg-gray-50 p-6">
    <div v-if="grading" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div class="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl">
        <h1 class="mb-4 text-xl font-bold text-gray-900">채점 중...</h1>
        <div class="mb-3 h-3 overflow-hidden rounded-full bg-gray-200">
          <div class="h-full bg-indigo-600 transition-all" :style="{ width: progress + '%' }"></div>
        </div>
        <p class="text-sm font-semibold text-gray-500">{{ Math.floor(progress) }}%</p>
      </div>
    </div>

    <div v-else class="w-full max-w-3xl rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
      <h1 class="mb-6 text-3xl font-extrabold text-gray-950">퀴즈 결과</h1>

      <div class="mb-8 grid grid-cols-3 gap-3 rounded-xl bg-gray-50 p-5">
        <div class="text-center">
          <p class="text-3xl font-bold text-green-600">{{ result.correctCount }}</p>
          <p class="text-sm font-medium text-gray-600">정답</p>
        </div>
        <div class="text-center">
          <p class="text-3xl font-bold text-red-600">{{ result.wrongCount }}</p>
          <p class="text-sm font-medium text-gray-600">오답</p>
        </div>
        <div class="text-center">
          <p class="text-3xl font-bold text-gray-500">{{ result.emptyCount }}</p>
          <p class="text-sm font-medium text-gray-600">미답변</p>
        </div>
      </div>

      <div class="space-y-5">
        <article
          v-for="(item, index) in result.details"
          :key="index"
          class="rounded-xl border border-gray-200 p-5"
        >
          <h2 class="mb-3 text-lg font-bold text-gray-900">Q{{ index + 1 }}. {{ item.questionText }}</h2>
          <p class="mb-1 text-sm">
            <strong>내 답:</strong>
            <span
              class="ml-2 font-bold"
              :class="{
                'text-green-600': item.status === 'correct',
                'text-red-600': item.status === 'wrong',
                'text-gray-500': item.status === 'empty',
              }"
            >
              {{ item.userAnswer || '미답변' }}
            </span>
          </p>
          <p class="mb-2 text-sm text-blue-700"><strong>정답:</strong> {{ item.correctAnswer }}</p>
          <p class="rounded-lg bg-gray-50 p-3 text-sm leading-6 text-gray-700">
            <strong>해설:</strong> {{ item.explanation || '등록된 해설이 없습니다.' }}
          </p>
        </article>
      </div>

      <button
        type="button"
        class="mt-8 w-full rounded-xl bg-indigo-600 py-3 text-lg font-bold text-white hover:bg-indigo-700"
        @click="router.push('/dashboard/my')"
      >
        내 문제지로 돌아가기
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getQuizAnswers, getQuizQuestions } from '@/api/quiz'

const route = useRoute()
const router = useRouter()
const quizId = route.params.id

const grading = ref(true)
const progress = ref(0)
const questions = ref([])
const answers = ref([])
const userAnswers = ref([])
const result = ref({
  correctCount: 0,
  wrongCount: 0,
  emptyCount: 0,
  details: [],
})
let gradingInterval = null

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '')
}

function isSimilarAnswer(userAnswer, correctAnswer) {
  const user = normalize(userAnswer)
  const correct = normalize(correctAnswer)
  if (!user || !correct) return false
  return user === correct || user.includes(correct) || correct.includes(user)
}

async function loadDataAndGrade() {
  const stored = sessionStorage.getItem('quiz_' + quizId + '_answers')
  if (!stored) {
    alert('풀이 기록이 없습니다. 퀴즈를 다시 풀어주세요.')
    router.replace('/dashboard/my')
    return
  }

  try {
    const parsed = JSON.parse(stored)
    userAnswers.value = Array.isArray(parsed) ? parsed : []
    const [questionResponse, answerResponse] = await Promise.all([
      getQuizQuestions(quizId),
      getQuizAnswers(quizId),
    ])
    questions.value = questionResponse.data || []
    answers.value = answerResponse.data || []
    startGrading()
  } catch (error) {
    console.error('결과 조회 실패:', error)
    alert('결과를 불러오지 못했습니다.')
    router.replace('/dashboard/my')
  }
}

function gradeQuiz() {
  const output = {
    correctCount: 0,
    wrongCount: 0,
    emptyCount: 0,
    details: [],
  }

  questions.value.forEach((question, index) => {
    const userAnswer = userAnswers.value[index] || ''
    const correctAnswer = answers.value[index]?.answer || ''
    const hasOptions = question.options && Object.keys(question.options).length > 0
    let status = 'wrong'

    if (!String(userAnswer).trim()) status = 'empty'
    else if (hasOptions && userAnswer === correctAnswer) status = 'correct'
    else if (!hasOptions && isSimilarAnswer(userAnswer, correctAnswer)) status = 'correct'

    if (status === 'correct') output.correctCount += 1
    else if (status === 'empty') output.emptyCount += 1
    else output.wrongCount += 1

    output.details.push({
      questionText: question.questionText,
      userAnswer,
      correctAnswer,
      explanation: answers.value[index]?.explanation || '',
      status,
    })
  })

  result.value = output
}

function startGrading() {
  gradingInterval = setInterval(() => {
    if (progress.value < 90) progress.value += Math.random() * 2 + 1
  }, 120)

  setTimeout(() => {
    gradeQuiz()
    clearInterval(gradingInterval)
    progress.value = 100
    setTimeout(() => {
      grading.value = false
    }, 300)
  }, 700)
}

onMounted(loadDataAndGrade)
onUnmounted(() => {
  if (gradingInterval) clearInterval(gradingInterval)
})
</script>
