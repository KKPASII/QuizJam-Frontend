<template>
  <div class="mx-auto w-full max-w-3xl rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-extrabold text-gray-950">퀴즈 생성</h1>
      <p class="mt-2 text-sm text-gray-600">PDF 자료를 기반으로 AI 문제지를 만듭니다.</p>
    </div>

    <form class="space-y-6" @submit.prevent="submit">
      <div>
        <label class="mb-2 block font-semibold text-gray-800">퀴즈 제목</label>
        <input
          v-model="quizTitle"
          type="text"
          class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="예: 네트워크 보안 기초"
        />
      </div>

      <div>
        <label class="mb-2 block font-semibold text-gray-800">PDF 파일</label>
        <div class="rounded-xl border-2 border-dashed border-gray-300 p-6 text-center transition hover:border-indigo-400">
          <input ref="fileInput" type="file" accept=".pdf" class="hidden" @change="handleFileUpload" />
          <button
            type="button"
            class="rounded-lg bg-indigo-50 px-4 py-2 font-semibold text-indigo-700 hover:bg-indigo-100"
            @click="fileInput?.click()"
          >
            파일 선택
          </button>

          <div v-if="fileName" class="mt-4">
            <p class="font-semibold text-gray-900">{{ fileName }}</p>
            <p v-if="isCalculating" class="mt-1 text-sm text-gray-500">PDF 내용을 확인하는 중...</p>
            <p
              v-else
              class="mt-1 text-sm"
              :class="isTokenOver ? 'font-semibold text-red-600' : 'text-green-700'"
            >
              예상 토큰 {{ estimatedTokens.toLocaleString() }} / {{ MAX_TOKENS.toLocaleString() }}
            </p>
          </div>
        </div>
      </div>

      <div>
        <label class="mb-2 block font-semibold text-gray-800">문제 유형</label>
        <div class="grid grid-cols-3 gap-3">
          <button
            v-for="type in types"
            :key="type"
            type="button"
            class="rounded-xl border px-4 py-3 font-semibold transition"
            :class="quizType === type ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'"
            @click="quizType = type"
          >
            {{ type }}
          </button>
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-2 block font-semibold text-gray-800">문제 수</label>
          <input
            v-model.number="questionCount"
            type="number"
            min="1"
            max="50"
            class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label class="mb-2 block font-semibold text-gray-800">난이도</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="level in levels"
              :key="level"
              type="button"
              class="rounded-xl border px-3 py-3 font-semibold transition"
              :class="difficulty === level ? 'border-green-600 bg-green-600 text-white' : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'"
              @click="difficulty = level"
            >
              {{ level }}
            </button>
          </div>
        </div>
      </div>

      <div>
        <label class="mb-2 block font-semibold text-gray-800">풀이 제한 시간</label>
        <div class="flex items-center gap-3">
          <input
            v-model.number="timer"
            type="number"
            min="1"
            max="60"
            class="w-32 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <span class="text-sm font-medium text-gray-600">분</span>
        </div>
      </div>

      <button
        type="submit"
        class="flex w-full items-center justify-center rounded-xl bg-indigo-600 py-3 text-lg font-bold text-white shadow-md transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="isGenerating || isCalculating"
      >
        {{ isGenerating ? '생성 중...' : '퀴즈 생성하기' }}
      </button>
    </form>

    <div v-if="isGenerating" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div class="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
        <div class="mx-auto mb-6 h-14 w-14 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600"></div>
        <h2 class="mb-2 text-xl font-bold text-gray-950">AI 퀴즈 생성 중</h2>
        <p class="mb-6 h-6 text-sm font-medium text-indigo-700">{{ loadingText }}</p>
        <div class="h-3 overflow-hidden rounded-full bg-gray-100">
          <div class="h-full rounded-full bg-indigo-600 transition-all" :style="{ width: progress + '%' }"></div>
        </div>
        <p class="mt-2 text-right text-xs font-bold text-gray-500">{{ Math.floor(progress) }}%</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getDocument, GlobalWorkerOptions, version } from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { createQuiz } from '@/api/quiz'

const router = useRouter()
GlobalWorkerOptions.workerSrc = pdfWorker

const MAX_TOKENS = 120000
const types = ['객관식', '단답형', 'OX']
const levels = ['쉬움', '보통', '어려움']

const quizTitle = ref('')
const quizType = ref('객관식')
const questionCount = ref(5)
const difficulty = ref('보통')
const timer = ref(3)
const fileName = ref('')
const selectedFile = ref(null)
const fileInput = ref(null)
const estimatedTokens = ref(0)
const isCalculating = ref(false)
const isTokenOver = ref(false)
const isGenerating = ref(false)
const progress = ref(0)
const loadingText = ref('')
let progressInterval = null

async function handleFileUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return
  selectedFile.value = file
  fileName.value = file.name
  await checkPdfTokens(file)
}

async function checkPdfTokens(file) {
  isCalculating.value = true
  isTokenOver.value = false
  estimatedTokens.value = 0

  try {
    const loadingTask = getDocument({
      data: await file.arrayBuffer(),
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@' + version + '/cmaps/',
      cMapPacked: true,
    })
    const pdf = await loadingTask.promise
    let fullText = ''

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber)
      const textContent = await page.getTextContent()
      fullText += textContent.items.map((item) => item.str).join(' ') + ' '
    }

    estimatedTokens.value = Math.ceil(fullText.length / 2.5)
    isTokenOver.value = estimatedTokens.value > MAX_TOKENS
  } catch (error) {
    console.error('PDF 읽기 실패:', error)
    alert('PDF 파일을 읽을 수 없습니다. 다른 파일로 다시 시도해주세요.')
    selectedFile.value = null
    fileName.value = ''
  } finally {
    isCalculating.value = false
  }
}

function startProgress() {
  isGenerating.value = true
  progress.value = 0
  loadingText.value = 'PDF를 업로드하고 있습니다.'

  progressInterval = setInterval(() => {
    if (progress.value < 90) progress.value += Math.random() * 2 + 0.5
    if (progress.value > 70) loadingText.value = '정답과 해설을 정리하고 있습니다.'
    else if (progress.value > 35) loadingText.value = '문제를 생성하고 있습니다.'
    else if (progress.value > 15) loadingText.value = '문서를 분석하고 있습니다.'
  }, 400)
}

async function submit() {
  if (!quizTitle.value.trim()) {
    alert('퀴즈 제목을 입력해주세요.')
    return
  }
  if (!selectedFile.value) {
    alert('PDF 파일을 선택해주세요.')
    return
  }
  if (isTokenOver.value) {
    alert('PDF 내용이 너무 깁니다. 더 짧은 파일로 다시 시도해주세요.')
    return
  }
  if (isGenerating.value) return

  startProgress()

  const quiz = {
    title: quizTitle.value.trim(),
    type: quizType.value,
    difficulty: difficulty.value,
    questionCount: questionCount.value,
    timeLimitMin: timer.value,
  }

  const formData = new FormData()
  formData.append('quiz', new Blob([JSON.stringify(quiz)], { type: 'application/json' }))
  formData.append('file', selectedFile.value)

  try {
    await createQuiz(formData)
    clearInterval(progressInterval)
    progress.value = 100
    loadingText.value = '완료되었습니다.'
    setTimeout(() => router.push({ name: 'MyQuiz' }), 500)
  } catch (error) {
    console.error('퀴즈 생성 실패:', error)
    clearInterval(progressInterval)
    isGenerating.value = false
    alert('퀴즈 생성 중 오류가 발생했습니다.')
  }
}
</script>
