<template>
  <div class="bg-white rounded-3xl shadow-2xl w-full max-w-3xl mx-auto p-10">
    <h2 class="text-3xl font-extrabold text-center mb-10 text-gray-900 tracking-tight">
      🧠 퀴즈 생성하기
    </h2>

    <!-- 제목 -->
    <div class="mb-6">
      <label class="block mb-2 text-gray-700 font-semibold">퀴즈 제목</label>
      <input
        v-model="quizTitle"
        type="text"
        placeholder="예: 네트워크 보안 기초 퀴즈"
        class="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 bg-gray-50"
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
          class="text-indigo-600 hover:text-indigo-800 font-medium"
        >
          📎 파일 업로드
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
          class="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 bg-gray-50"
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
        class="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 bg-gray-50"
      />
    </div>

    <!-- 생성 버튼 -->
    <button
      @click="submit"
      class="w-full py-3 text-lg bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-md"
    >
      🚀 퀴즈 생성하기
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { createQuiz } from '@/api/quiz'

const quizTitle = ref('')
const quizType = ref('객관식')
const questionCount = ref(5)
const difficulty = ref('Easy')
const timer = ref(30)
const fileName = ref('')
const selectedFile = ref(null)
const fileInput = ref(null)

const types = ['객관식', '단답형', 'OX 퀴즈']
const levels = ['Easy', 'Medium', 'Hard']

function handleFileUpload(e) {
  const file = e.target.files[0]
  if (file) {
    selectedFile.value = file
    fileName.value = file.name
  }
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
    alert(`✅ 퀴즈 생성 완료: ${data.title || quizTitle.value}`)
  } catch (e) {
    console.error('❌ 퀴즈 생성 실패', e)
    alert('퀴즈 생성 중 오류가 발생했습니다.')
  }
}
</script>
