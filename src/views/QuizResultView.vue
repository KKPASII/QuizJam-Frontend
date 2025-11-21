<template>
  <div class="min-h-screen bg-gray-50 p-6 flex justify-center">
    <!-- 📌 채점 모달 -->
    <div
      v-if="grading"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="bg-white p-8 rounded-2xl shadow-xl w-80 text-center">
        <h2 class="text-xl font-bold mb-4">채점 중...</h2>

        <div class="w-full bg-gray-200 h-3 rounded-full overflow-hidden mb-3">
          <div
            class="h-full bg-indigo-500 transition-all duration-200"
            :style="{ width: progress + '%' }"
          ></div>
        </div>

        <p class="text-gray-600">{{ Math.floor(progress) }}%</p>
      </div>
    </div>

    <!-- 📌 결과 화면 -->
    <div v-else class="max-w-3xl w-full bg-white shadow-xl rounded-2xl p-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">📊 퀴즈 결과</h1>

      <!-- 요약 -->
      <div class="flex justify-around py-6 bg-gray-50 rounded-xl mb-8">
        <div class="text-center">
          <p class="text-3xl font-bold text-green-600">{{ result.correctCount }}</p>
          <p class="text-gray-600">정답</p>
        </div>

        <div class="text-center">
          <p class="text-3xl font-bold text-red-600">{{ result.wrongCount }}</p>
          <p class="text-gray-600">오답</p>
        </div>

        <div class="text-center">
          <p class="text-3xl font-bold text-gray-500">{{ result.emptyCount }}</p>
          <p class="text-gray-600">미답변</p>
        </div>
      </div>

      <!-- 상세 결과 -->
      <div v-for="(item, idx) in result.details" :key="idx" class="mb-6 p-5 border rounded-xl">
        <h2 class="font-bold text-lg mb-3">Q{{ idx + 1 }}. {{ item.questionText }}</h2>

        <!-- 내 답 -->
        <p class="mb-1 flex items-center gap-2">
          <strong>내 답:</strong>
          <span
            class="font-bold"
            :class="{
              'text-green-600': item.status === 'correct',
              'text-red-600': item.status === 'wrong',
              'text-gray-500': item.status === 'empty',
            }"
          >
            {{ item.userAnswer || '미답변' }}
          </span>
          <span v-if="item.status === 'correct'">✅</span>
          <span v-else-if="item.status === 'wrong'">❌</span>
        </p>

        <!-- 정답 -->
        <p class="text-blue-700 mb-2"><strong>정답:</strong> {{ item.correctAnswer }}</p>

        <!-- 해설 -->
        <p class="mt-2 text-sm bg-gray-50 p-3 rounded">
          💡 <strong>해설:</strong> {{ item.explanation }}
        </p>
      </div>

      <button
        @click="goBack"
        class="mt-8 w-full py-3 bg-indigo-600 text-white rounded-xl text-lg hover:bg-indigo-700"
      >
        돌아가기
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getQuizQuestions, getQuizAnswers } from '@/api/quiz'

const route = useRoute()
const router = useRouter()
const quizId = route.params.id

const userAnswers = ref([])

const grading = ref(true)
const progress = ref(0)
let gradingInterval = null

const questions = ref([])
const answers = ref([])

const result = ref({
  correctCount: 0,
  wrongCount: 0,
  emptyCount: 0,
  details: [],
})

function normalize(str) {
  return str ? str.trim().toLowerCase() : ''
}

async function loadDataAndGrade() {
  // ✅ 1. sessionStorage에서 답안 꺼내오기
  const stored = sessionStorage.getItem(`quiz_${quizId}_answers`)

  if (!stored) {
    alert('잘못된 접근입니다. 퀴즈를 다시 풀어주세요.')
    router.replace('/dashboard/my')
    return
  }

  try {
    const parsed = JSON.parse(stored)
    if (Array.isArray(parsed)) {
      userAnswers.value = parsed
    } else {
      // 혹시 객체 형태라면 배열로 변환
      userAnswers.value = Object.keys(parsed)
        .sort((a, b) => Number(a) - Number(b))
        .map((key) => parsed[key])
    }
  } catch (e) {
    console.error('답안 파싱 실패:', e)
    alert('결과를 불러오지 못했습니다. 다시 시도해주세요.')
    router.replace('/dashboard/my')
    return
  }

  try {
    grading.value = true

    const [qRes, aRes] = await Promise.all([getQuizQuestions(quizId), getQuizAnswers(quizId)])

    questions.value = qRes.data
    answers.value = aRes.data

    startGrading()
  } catch (err) {
    console.error('결과 데이터를 불러오지 못했습니다:', err)
    alert('결과를 불러오지 못했습니다. 다시 시도해주세요.')
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

  questions.value.forEach((q, i) => {
    const user = userAnswers.value[i] || ''
    const correct = answers.value[i]?.answer
    const explanation = answers.value[i]?.explanation ?? ''

    let status = 'wrong'

    if (!user) {
      status = 'empty'
    } else if (q.options && Object.keys(q.options).length) {
      // 객관식
      if (user === correct) status = 'correct'
    } else {
      // 주관식: 대소문자/공백 무시
      if (normalize(user) === normalize(correct)) status = 'correct'
    }

    if (status === 'correct') output.correctCount++
    else if (status === 'empty') output.emptyCount++
    else output.wrongCount++

    output.details.push({
      questionText: q.questionText,
      userAnswer: user,
      correctAnswer: correct,
      explanation,
      status,
    })
  })

  result.value = output
}

function startGrading() {
  gradingInterval = setInterval(() => {
    if (progress.value < 90) {
      progress.value += Math.random() * 2 + 1
    }
  }, 120)

  setTimeout(() => {
    gradeQuiz()
    clearInterval(gradingInterval)
    progress.value = 100

    setTimeout(() => {
      grading.value = false
    }, 400)
  }, 800)
}

function goBack() {
  router.push('/dashboard/my')
}

onMounted(loadDataAndGrade)
onUnmounted(() => {
  if (gradingInterval) clearInterval(gradingInterval)
})
</script>
