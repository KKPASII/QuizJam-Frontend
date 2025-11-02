<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center py-10">
    <div class="max-w-3xl w-full bg-white shadow-xl rounded-2xl p-8">
      <h1 class="text-3xl font-bold text-indigo-700 mb-6 text-center">
        {{ quizTitle || '로딩 중...' }} 🎯
      </h1>

      <div v-if="loading" class="text-center text-gray-500 py-10">불러오는 중입니다...</div>

      <div v-else>
        <div v-for="(question, index) in quizList" :key="index" class="mb-8 border-b pb-6">
          <h2 class="text-xl font-semibold mb-4">{{ index + 1 }}. {{ question.questionText }}</h2>

          <!-- 객관식 보기 -->
          <div v-if="question.options" class="grid grid-cols-2 gap-3 mb-4">
            <button
              v-for="(optionText, key) in question.options"
              :key="key"
              @click="selectAnswer(index, key)"
              class="border rounded-lg px-4 py-2 text-left hover:bg-indigo-50"
              :class="{
                'bg-indigo-600 text-white': userAnswers[index] === key,
              }"
            >
              {{ key }}. {{ optionText }}
            </button>
          </div>

          <!-- 단답형 -->
          <div v-else>
            <input
              type="text"
              v-model="userAnswers[index]"
              class="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-indigo-400"
              placeholder="정답을 입력하세요..."
            />
          </div>

          <!-- 힌트 -->
          <p v-if="showHints" class="text-gray-500 mt-2 text-sm">💡 {{ question.hint }}</p>
        </div>

        <!-- 힌트 토글 버튼 -->
        <div class="text-center mt-4">
          <button
            @click="showHints = !showHints"
            class="px-4 py-2 text-sm text-indigo-600 font-semibold hover:underline"
          >
            {{ showHints ? '힌트 숨기기' : '힌트 보기' }}
          </button>
        </div>

        <!-- 제출 버튼 -->
        <div class="text-center mt-6">
          <button
            @click="submitQuiz"
            class="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700"
          >
            제출하기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { dummyQuestions } from '@/data/dummyQuestions'
import { dummyAnswers } from '@/data/dummyAnswers'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const quizId = route.params.id

const quizTitle = ref('')
const quizList = ref([])
const userAnswers = ref({})
const showHints = ref(false)
const loading = ref(true)

async function fetchQuiz() {
  try {
    const res = await axios.get(`/api/quiz/${quizId}`)
    quizTitle.value = res.data.title
    quizList.value = res.data.questions
  } catch (err) {
    console.error('❌ 퀴즈 불러오기 실패 — 더미 데이터 사용:', err)
    quizTitle.value = 'AI 보안 기초 퀴즈 (더미)'
    quizList.value = dummyQuestions
  } finally {
    loading.value = false
  }
}

function selectAnswer(qIndex, choiceKey) {
  userAnswers.value[qIndex] = choiceKey
}

async function submitQuiz() {
  console.log('📤 제출된 답안:', userAnswers.value)

  let answers = {}
  try {
    const res = await axios.get(`/api/quiz/${quizId}/answers`)
    answers = res.data.answers
  } catch (err) {
    console.warn('⚠️ 정답 API 실패 — 더미 데이터 사용', err)
    dummyAnswers.forEach((a) => {
      answers[a.question_id] = a.correct_answer
    })
  }

  const resultData = quizList.value.map((q, idx) => ({
    question: q.questionText,
    userAnswer: userAnswers.value[idx],
    correctAnswer: answers[q.id],
    isCorrect: userAnswers.value[idx] === answers[q.id],
  }))

  console.table(resultData)

  router.push({
    name: 'quiz-result',
    query: { result: JSON.stringify(resultData), title: quizTitle.value },
  })
}

onMounted(() => {
  fetchQuiz()
})
</script>
