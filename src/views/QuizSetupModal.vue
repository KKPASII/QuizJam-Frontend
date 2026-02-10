<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 transition"
  >
    <div
      class="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-10 relative transform transition-all scale-100 hover:scale-[1.01]"
    >
      <!-- 닫기 버튼 -->
      <button
        @click="close"
        class="absolute top-5 right-5 text-gray-400 hover:text-gray-700 text-xl transition"
      >
        ✕
      </button>

      <!-- 제목 -->
      <h2 class="text-3xl font-extrabold text-center mb-8 text-gray-900 tracking-tight">
        🧠 퀴즈 생성하기
      </h2>

      <!-- 퀴즈 제목 -->
      <div class="mb-6">
        <label class="block mb-2 text-gray-700 font-semibold">퀴즈 제목</label>
        <input
          v-model="quizTitle"
          type="text"
          placeholder="예: 네트워크 보안 기초 퀴즈"
          class="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
        />
      </div>

      <!-- 파일 업로드 -->
      <div class="mb-6">
        <label class="block mb-2 text-gray-700 font-semibold">첨부 파일 (PDF)</label>
        <div
          class="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center hover:border-indigo-400 hover:bg-indigo-50 transition"
        >
          <input
            type="file"
            accept=".pdf"
            @change="handleFileUpload"
            class="hidden"
            ref="fileInput"
          />
          <button
            @click="$refs.fileInput.click()"
            class="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 16.5v-9m0 0L8.25 10.5M12 7.5l3.75 3m-7.5 9A9 9 0 1112 21a9 9 0 01-3.75-.75"
              />
            </svg>
            <span>파일 업로드</span>
          </button>
          <p v-if="fileName" class="text-sm text-gray-500 mt-3">📄 {{ fileName }}</p>
        </div>
      </div>

      <!-- 문제 유형 -->
      <div class="mb-6">
        <label class="block mb-2 text-gray-700 font-semibold">문제 유형</label>
        <div class="flex gap-3">
          <button
            v-for="type in types"
            :key="type"
            @click="quizType = type"
            class="flex-1 border rounded-xl py-3 font-medium transition text-base"
            :class="
              quizType === type
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-50 hover:bg-gray-100 border-gray-300 text-gray-700'
            "
          >
            {{ type }}
          </button>
        </div>
      </div>

      <!-- 문제 수 & 난이도 -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label class="block mb-2 text-gray-700 font-semibold">문제 수</label>
          <input
            v-model.number="questionCount"
            type="number"
            min="1"
            placeholder="예: 5"
            class="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
          />
        </div>
        <div>
          <label class="block mb-2 text-gray-700 font-semibold">난이도</label>
          <div class="flex gap-2">
            <button
              v-for="level in levels"
              :key="level"
              @click="difficulty = level"
              class="flex-1 border rounded-xl py-3 font-medium transition text-base"
              :class="
                difficulty === level
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-50 hover:bg-gray-100 border-gray-300 text-gray-700'
              "
            >
              {{ level }}
            </button>
          </div>
        </div>
      </div>

      <!-- 타이머 -->
      <div class="mb-8">
        <label class="block mb-2 text-gray-700 font-semibold">타이머 (초)</label>
        <input
          v-model.number="timer"
          type="number"
          min="10"
          placeholder="예: 30"
          class="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
        />
      </div>

      <!-- 생성 버튼 -->
      <button
        @click="submit"
        class="w-full py-3 text-lg bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
      >
        🚀 퀴즈 생성하기
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { createQuiz } from '@/api/quiz'

const { isOpen } = defineProps({
  isOpen: { type: Boolean, required: true },
})
const emit = defineEmits(['close', 'submit'])

const quizTitle = ref('')
const quizType = ref('객관식')
const questionCount = ref(5)
const difficulty = ref('Easy')
const timer = ref(30)
const fileName = ref('')
const selectedFile = ref(null)
const fileInput = ref(null)

const types = ['객관식', '단답식', 'OX 퀴즈']
const levels = ['Easy', 'Medium', 'Hard']

function handleFileUpload(e) {
  const file = e.target.files[0]
  if (file) {
    selectedFile.value = file
    fileName.value = file.name
  }
}
function close() {
  emit('close')
}

async function submit() {
  const quizJson = {
    title: quizTitle.value,
    type: quizType.value,
    difficulty: difficulty.value,
    questionCount: questionCount.value,
    timeSec: timer.value,
  }

  const formData = new FormData()
  formData.append('quiz', new Blob([JSON.stringify(quizJson)], { type: 'application/json' }))
  if (selectedFile.value) formData.append('file', selectedFile.value)

  try {
    const { data } = await createQuiz({ formData })
    emit('submit', data)
    emit('close')
  } catch (e) {
    console.error('❌ 퀴즈 생성 실패 — 더미 데이터로 대체합니다.', e)
    const dummyQuiz = {
      quizId: 1,
      title: quizTitle.value || 'AI 보안 기초 퀴즈 (더미)',
    }
    emit('submit', dummyQuiz)
    emit('close')
  }
}
</script>

<style scoped>
.fixed {
  animation: fadeIn 0.25s ease-in-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.97);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
