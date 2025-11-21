<template>
  <div class="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
    <div class="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-8 min-h-[500px] relative">
      <!-- 로딩 -->
      <div v-if="loading" class="flex flex-col items-center justify-center h-96 space-y-4">
        <div
          class="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"
        ></div>
        <p class="text-gray-500 font-medium">문제를 불러오고 있습니다...</p>
      </div>

      <!-- 문제 없음 -->
      <div v-else-if="questions.length === 0" class="text-center py-20 text-gray-500">
        문제가 없습니다.
      </div>

      <!-- 문제 표시 -->
      <div v-else>
        <!-- 상단 -->
        <div class="flex justify-between text-sm text-gray-500 mb-2 font-semibold">
          <span>Question {{ currentIndex + 1 }} / {{ questions.length }}</span>

          <span :class="{ 'text-red-600 animate-pulse': timeLeft < 60 }">
            남은 시간: {{ formattedTime }}
          </span>
        </div>

        <!-- 진행바 -->
        <div class="w-full bg-gray-100 h-2 rounded-full mb-8 overflow-hidden">
          <div
            class="bg-indigo-500 h-full transition-all duration-300"
            :style="{ width: `${((currentIndex + 1) / questions.length) * 100}%` }"
          ></div>
        </div>

        <!-- 문제 텍스트 -->
        <h2 class="text-2xl font-bold text-gray-800 mb-8 leading-relaxed">
          Q. {{ currentQuestion.questionText }}
        </h2>

        <!-- 객관식 -->
        <div
          v-if="currentQuestion.options && Object.keys(currentQuestion.options).length"
          class="space-y-3"
        >
          <button
            v-for="(text, key) in currentQuestion.options"
            :key="key"
            @click="selectAnswer(key)"
            class="w-full text-left p-4 rounded-xl border-2 transition-all"
            :class="
              userAnswers[currentIndex] === key
                ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                : 'border-gray-200 bg-white hover:bg-indigo-50 hover:border-indigo-300'
            "
          >
            <span
              class="font-bold mr-3 px-2 py-1 rounded bg-gray-100"
              :class="
                userAnswers[currentIndex] === key
                  ? 'bg-indigo-200 text-indigo-800'
                  : 'text-gray-600'
              "
            >
              {{ key }}
            </span>
            {{ text }}
          </button>
        </div>

        <!-- 주관식 -->
        <div v-else class="mt-4">
          <input
            v-model="subjectiveAnswer"
            @input="saveSubjectiveAnswer"
            type="text"
            placeholder="정답을 입력하세요"
            class="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 outline-none text-lg"
          />
        </div>

        <!-- 힌트 -->
        <div v-if="currentQuestion.hint" class="mt-6">
          <button
            @click="toggleHint(currentIndex)"
            class="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            {{ showHint[currentIndex] ? '🙈 힌트 숨기기' : '💡 힌트 보기' }}
          </button>

          <transition name="fade">
            <div
              v-if="showHint[currentIndex]"
              class="mt-3 bg-yellow-50 text-yellow-800 p-4 rounded-lg text-sm"
            >
              💡 {{ currentQuestion.hint }}
            </div>
          </transition>
        </div>

        <!-- 버튼 -->
        <div class="flex justify-between mt-10 pt-6 border-t border-gray-200">
          <button
            @click="prevQuestion"
            :disabled="currentIndex === 0"
            class="px-6 py-2 text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            이전 문제
          </button>

          <button
            v-if="currentIndex < questions.length - 1"
            @click="nextQuestion"
            class="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg"
          >
            다음 문제
          </button>

          <button
            v-else
            @click="submitQuiz"
            class="px-8 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-lg"
          >
            제출하기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getQuizById, getQuizQuestions } from '@/api/quiz'

const router = useRouter()
const route = useRoute()
const quizId = route.params.id

const questions = ref([])
const loading = ref(true)

const currentIndex = ref(0)
const userAnswers = ref([]) // ✅ 배열로 유지
const subjectiveAnswer = ref('')
const showHint = ref([])

const timeLeft = ref(0)
const timerInterval = ref(null)
const isSubmitting = ref(false)

const currentQuestion = computed(() => questions.value[currentIndex.value] || {})
const formattedTime = computed(() => {
  const m = Math.floor(timeLeft.value / 60)
  const s = timeLeft.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

async function loadData() {
  try {
    const [quizRes, qRes] = await Promise.all([getQuizById(quizId), getQuizQuestions(quizId)])

    timeLeft.value = (quizRes.data.timeLimitMin ?? 3) * 60
    questions.value = qRes.data
    showHint.value = Array(questions.value.length).fill(false)

    loading.value = false
    startTimer()
  } catch (e) {
    console.error(e)
    alert('퀴즈를 불러오지 못했습니다.')
    router.replace('/dashboard/my')
  }
}

function startTimer() {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }

  timerInterval.value = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      clearInterval(timerInterval.value)
      timerInterval.value = null
      autoSubmit()
    }
  }, 1000)
}

function selectAnswer(a) {
  userAnswers.value[currentIndex.value] = a
}

function saveSubjectiveAnswer() {
  userAnswers.value[currentIndex.value] = subjectiveAnswer.value
}

function prevQuestion() {
  if (currentIndex.value === 0) return
  currentIndex.value--
  subjectiveAnswer.value = userAnswers.value[currentIndex.value] || ''
}

function nextQuestion() {
  if (currentIndex.value >= questions.value.length - 1) return
  currentIndex.value++
  subjectiveAnswer.value = userAnswers.value[currentIndex.value] || ''
}

function toggleHint(i) {
  showHint.value[i] = !showHint.value[i]
}

function allAnswered() {
  return questions.value.every((_, i) => {
    const ans = userAnswers.value[i]
    return ans && ans.trim() !== ''
  })
}

function autoSubmit() {
  if (isSubmitting.value) return
  goToResultPage()
}

function submitQuiz() {
  if (timeLeft.value <= 0) {
    alert('시간이 종료되어 자동 제출되었습니다.')
    return
  }

  if (!allAnswered()) {
    alert('아직 답하지 않은 문제가 있습니다!')
    return
  }

  goToResultPage()
}

function goToResultPage() {
  if (isSubmitting.value) return
  isSubmitting.value = true

  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }

  // ✅ 여기! sessionStorage에 내가 고른 답안 저장
  try {
    sessionStorage.setItem(`quiz_${quizId}_answers`, JSON.stringify(userAnswers.value))
  } catch (e) {
    console.error('답안 저장 실패:', e)
  }

  router.push({
    name: 'quiz-result',
    params: { id: quizId },
  })
}

onMounted(loadData)
onUnmounted(() => {
  if (timerInterval.value) clearInterval(timerInterval.value)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.25s ease-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(5px);
}
</style>
