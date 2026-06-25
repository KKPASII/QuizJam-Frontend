<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
    <form class="w-full max-w-lg rounded-2xl bg-white p-7 shadow-2xl" @submit.prevent="submit">
      <div class="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 class="text-2xl font-extrabold text-gray-950">퀴즈 생성</h2>
          <p class="mt-1 text-sm text-gray-600">PDF와 생성 옵션을 입력하세요.</p>
        </div>
        <button type="button" class="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700" @click="close">
          닫기
        </button>
      </div>

      <div class="space-y-5">
        <div>
          <label class="mb-2 block text-sm font-semibold text-gray-700">퀴즈 제목</label>
          <input
            v-model="quizTitle"
            type="text"
            class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="예: 운영체제 기초"
          />
        </div>

        <div>
          <label class="mb-2 block text-sm font-semibold text-gray-700">PDF 파일</label>
          <input ref="fileInput" type="file" accept=".pdf" class="hidden" @change="handleFileUpload" />
          <button
            type="button"
            class="w-full rounded-xl border-2 border-dashed border-gray-300 px-4 py-5 text-sm font-semibold text-indigo-700 hover:border-indigo-400 hover:bg-indigo-50"
            @click="fileInput?.click()"
          >
            {{ fileName || '파일 선택' }}
          </button>
        </div>

        <div>
          <label class="mb-2 block text-sm font-semibold text-gray-700">문제 유형</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="type in types"
              :key="type"
              type="button"
              class="rounded-xl border px-3 py-3 font-semibold transition"
              :class="quizType === type ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'"
              @click="quizType = type"
            >
              {{ type }}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="mb-2 block text-sm font-semibold text-gray-700">문제 수</label>
            <input
              v-model.number="questionCount"
              type="number"
              min="1"
              class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-semibold text-gray-700">제한 시간</label>
            <input
              v-model.number="timeLimitMin"
              type="number"
              min="1"
              class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        class="mt-7 w-full rounded-xl bg-indigo-600 py-3 font-bold text-white hover:bg-indigo-700"
      >
        생성 요청
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['close', 'submit'])

const types = ['객관식', '단답형', 'OX']
const quizTitle = ref('')
const quizType = ref('객관식')
const questionCount = ref(5)
const timeLimitMin = ref(3)
const fileName = ref('')
const selectedFile = ref(null)
const fileInput = ref(null)

function handleFileUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return
  selectedFile.value = file
  fileName.value = file.name
}

function close() {
  emit('close')
}

function submit() {
  emit('submit', {
    title: quizTitle.value,
    type: quizType.value,
    questionCount: questionCount.value,
    timeLimitMin: timeLimitMin.value,
    file: selectedFile.value,
  })
}
</script>
