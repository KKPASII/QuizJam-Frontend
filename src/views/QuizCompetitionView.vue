<template>
  <div
    class="min-h-screen bg-gradient-to-br from-indigo-100 to-blue-50 flex flex-col items-center p-8"
  >
    <!-- 상단 -->
    <header class="flex justify-between items-center w-full max-w-3xl mb-6">
      <div class="text-2xl font-bold text-indigo-700">🏆 QuizJam 경쟁모드</div>
      <div class="flex items-center gap-6">
        <div class="text-xl font-semibold text-gray-700">점수: {{ score }}</div>
        <div class="text-xl font-semibold text-gray-700">⏱ {{ timer }}초</div>
      </div>
    </header>

    <!-- 타이머 진행 바 -->
    <div class="w-full max-w-3xl mb-6">
      <div class="h-3 bg-gray-300 rounded-full overflow-hidden">
        <div
          class="h-3 bg-indigo-500 transition-all duration-500 ease-linear"
          :style="{ width: `${(timer / maxTime) * 100}%` }"
        ></div>
      </div>
    </div>

    <!-- 문제 카드 -->
    <div class="bg-white shadow-xl rounded-2xl w-full max-w-3xl p-8 text-center">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">{{ currentQuestion.question }}</h2>

      <div class="grid grid-cols-1 gap-4">
        <button
          v-for="(option, idx) in currentQuestion.options"
          :key="idx"
          class="py-3 px-4 rounded-lg text-lg border transition hover:bg-indigo-100"
          :class="{
            'bg-green-200 border-green-400':
              selectedOption === option && option === currentQuestion.answer,
            'bg-red-200 border-red-400':
              selectedOption === option && option !== currentQuestion.answer,
          }"
          @click="selectOption(option)"
          :disabled="selectedOption !== null"
        >
          {{ option }}
        </button>
      </div>

      <!-- 다음 버튼 -->
      <div class="mt-8">
        <button
          @click="nextQuestion"
          class="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50"
          :disabled="selectedOption === null"
        >
          다음 문제 →
        </button>
      </div>
    </div>

    <!-- 하단 진행 표시 -->
    <footer class="mt-6 text-gray-600">{{ currentIndex + 1 }} / {{ questions.length }} 문제</footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

// 문제 더미 데이터
const questions = ref([
  {
    question: '파이썬의 창시자는 누구일까요?',
    options: ['Guido van Rossum', 'Linus Torvalds', 'Bill Gates', 'Elon Musk'],
    answer: 'Guido van Rossum',
  },
  {
    question: 'Java의 창시자는?',
    options: ['James Gosling', 'Dennis Ritchie', 'Bjarne Stroustrup', 'Ken Thompson'],
    answer: 'James Gosling',
  },
  {
    question: 'HTML은 무엇의 약자일까요?',
    options: [
      'HyperText Markup Language',
      'HighText Machine Language',
      'HomeTool Markup Language',
      'None',
    ],
    answer: 'HyperText Markup Language',
  },
])

// 상태 관리
const currentIndex = ref(0)
const currentQuestion = ref(questions.value[currentIndex.value])
const selectedOption = ref(null)
const score = ref(0)
const maxTime = 30
const timer = ref(maxTime)
const interval = ref(null)

// 정답 선택
function selectOption(option) {
  selectedOption.value = option
  if (option === currentQuestion.value.answer) {
    score.value += 10
  }
}

// 다음 문제 이동
function nextQuestion() {
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
    currentQuestion.value = questions.value[currentIndex.value]
    selectedOption.value = null
    timer.value = maxTime
  } else {
    clearInterval(interval.value)
    alert(`퀴즈 완료! 최종 점수: ${score.value}점`)
  }
}

// 타이머 동작
onMounted(() => {
  interval.value = setInterval(() => {
    if (timer.value > 0) {
      timer.value--
    } else {
      nextQuestion()
    }
  }, 1000)
})

onUnmounted(() => {
  if (interval.value) clearInterval(interval.value)
})

watch(currentIndex, () => {
  timer.value = maxTime
})
</script>

<style scoped>
button:disabled {
  cursor: not-allowed;
}
</style>
