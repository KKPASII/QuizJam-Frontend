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
        class="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center hover:border-indigo-400 transition"
      >
        <input
          type="file"
          accept=".pdf"
          @change="handleFileUpload"
          class="hidden"
          ref="fileInput"
        />
        <button @click="$refs.fileInput.click()" class="text-indigo-600 font-medium">
          파일 업로드
        </button>

        <div v-if="fileName" class="mt-3 text-center">
          <p class="text-sm text-gray-900 font-bold">📄 {{ fileName }}</p>

          <p v-if="isCalculating" class="text-xs text-gray-500 mt-1">⏳ 토큰 계산 중...</p>

          <div v-else class="mt-2">
            <p class="text-xs" :class="isTokenOver ? 'text-red-600 font-bold' : 'text-green-600'">
              📊 예상 토큰: {{ estimatedTokens.toLocaleString() }} /
              {{ MAX_TOKENS.toLocaleString() }}
            </p>
            <p v-if="isTokenOver" class="text-xs text-red-500 mt-1">
              ⚠️ 파일 내용이 너무 깁니다. 더 짧은 파일을 올려주세요.
            </p>
          </div>
        </div>
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
      <label class="block mb-2 text-gray-700 font-semibold">제한 시간 (분)</label>
      <input
        v-model.number="timer"
        type="number"
        min="1"
        max="60"
        placeholder="예: 3 (3분)"
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
  <div
    v-if="isGenerating"
    class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]"
  >
    <div
      class="bg-white rounded-2xl p-10 max-w-sm w-full shadow-2xl text-center transform transition-all scale-100"
    >
      <div class="mb-6 relative">
        <div
          class="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto"
        ></div>
        <div class="absolute inset-0 flex items-center justify-center text-2xl animate-pulse">
          🤖
        </div>
      </div>

      <h3 class="text-xl font-bold text-gray-900 mb-3">AI 퀴즈 생성 중...</h3>

      <p
        class="text-indigo-600 font-medium text-sm mb-8 h-6 animate-fade-in-up transition-all duration-300"
      >
        {{ loadingText }}
      </p>

      <div
        class="w-full bg-gray-100 rounded-full h-4 mb-2 overflow-hidden inner-shadow border border-gray-200"
      >
        <div
          class="bg-gradient-to-r from-indigo-500 to-purple-600 h-4 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>

      <div class="flex justify-end mt-2">
        <span class="text-xs font-bold text-gray-500">{{ Math.floor(progress) }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createQuiz } from '@/api/quiz'
import { getDocument, GlobalWorkerOptions, version } from 'pdfjs-dist' // 'version': cMapUrl에서 사용하기 위해 필수
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

const router = useRouter()
GlobalWorkerOptions.workerSrc = pdfWorker

// 토큰 관련 상태 변수
const estimatedTokens = ref(0)
const isCalculating = ref(false)
const isTokenOver = ref(false)

// 🟢 [추가됨] 로딩 및 프로그레스 관련 변수
const isGenerating = ref(false)
const progress = ref(0)
const loadingText = ref('')
let progressInterval = null

// ⚙️ 설정: 사용할 모델에 따른 최대 토큰 수 (여유 있게 설정)
// gpt-3.5-turbo: 16,000 / gpt-4o-mini: 128,000
const MAX_TOKENS = 120000 // 프롬프트 등 고려해서 제한

const quizTitle = ref('')
const quizType = ref('객관식')
const questionCount = ref(5)
const difficulty = ref('보통')
const timer = ref(3)
const fileName = ref('')
const selectedFile = ref(null)
const fileInput = ref(null)

const types = ['객관식', '단답식', 'OX']
const levels = ['쉬움', '보통', '어려움']

async function handleFileUpload(e) {
  const file = e.target.files[0]
  if (!file) return

  selectedFile.value = file
  fileName.value = file.name

  // 토큰 계산 시작
  await checkPdfTokens(file)
}

// PDF 텍스트 추출 및 토큰 계산 함수
async function checkPdfTokens(file) {
  isCalculating.value = true
  isTokenOver.value = false
  estimatedTokens.value = 0

  try {
    const arrayBuffer = await file.arrayBuffer()

    // getDocument 호출
    // cMapUrl 등은 한글 깨짐 방지를 위해 추가하면 좋음 (옵션)
    const loadingTask = getDocument({
      data: arrayBuffer,
      cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/cmaps/`,
      cMapPacked: true,
    })

    const pdf = await loadingTask.promise

    let fullText = ''

    // 모든 페이지 돌면서 텍스트 추출
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map((item) => item.str).join(' ') // 아이템 사이에 공백을 넣어줘야 단어가 붙지 않음
      fullText += pageText + ' '
    }

    // 🧮 토큰 수 추정 (휴리스틱 방식)
    // 영어: 1토큰 ≈ 4글자 (0.25)
    // 한글: 1토큰 ≈ 1~2글자 (가변적임, 보수적으로 0.6 정도로 계산)
    // 안전하게 "글자수 / 2" 정도로 잡으면 얼추 맞거나 실제보다 높게 잡힘 (안전빵)
    const charCount = fullText.length

    const estimated = Math.ceil(charCount / 2.5) // 대략적인 계산식 - 토큰 추정 (글자수 / 2.5)

    estimatedTokens.value = estimated

    if (estimated > MAX_TOKENS) {
      isTokenOver.value = true
    }

    console.log(`📄 글자수: ${charCount}, 📊 예상 토큰: ${estimated}`)
  } catch (err) {
    console.error('❌ PDF 처리 상세 에러:', err)

    if (err.name === 'MissingPDFException') {
      alert('PDF 파일이 손상되었습니다.')
    } else if (err.name === 'InvalidPDFException') {
      alert('유효하지 않은 PDF 파일입니다.')
    } else {
      alert(
        `PDF를 읽을 수 없습니다. (에러: ${err.message})\n암호가 걸려있거나 스캔본(이미지)일 수 있습니다.`,
      )
    }

    selectedFile.value = null
    fileName.value = ''
  } finally {
    isCalculating.value = false
  }
}

// 🟢 [추가됨] 프로그레스 바 시뮬레이션 함수
function startProgress() {
  isGenerating.value = true
  progress.value = 0
  loadingText.value = 'PDF 문서를 업로드하고 있습니다...'

  // 0.4초마다 진행률 증가 (최대 90%까지만)
  progressInterval = setInterval(() => {
    if (progress.value < 90) {
      // 랜덤하게 0.5~2.5%씩 증가시켜 자연스럽게 연출
      progress.value += Math.random() * 2 + 0.5
    }

    // 진행률에 따라 멘트 변경
    if (progress.value > 15 && progress.value < 40) {
      loadingText.value = 'AI가 문서를 분석하고 있습니다...'
    } else if (progress.value >= 40 && progress.value < 75) {
      loadingText.value = '퀴즈 문제를 생성하고 있습니다...'
    } else if (progress.value >= 75) {
      loadingText.value = '정답과 해설을 검토 중입니다...'
    }
  }, 400)
}

async function submit() {
  if (isTokenOver.value) {
    alert('파일 용량이 너무 큽니다.')
    return
  }
  // 중복 클릭 방지
  if (isGenerating.value) return

  // 1. 로딩 시작 (프로그레스 바 가동)
  startProgress()

  const quizJson = {
    title: quizTitle.value,
    type: quizType.value,
    difficulty: difficulty.value,
    questionCount: questionCount.value,
    timeLimitMin: timer.value,
  }

  const formData = new FormData()
  formData.append('quiz', new Blob([JSON.stringify(quizJson)], { type: 'application/json' }))
  if (selectedFile.value) formData.append('file', selectedFile.value)

  try {
    // 2. API 요청 (대기 발생)
    const { data } = await createQuiz(formData)

    // 3. 완료 처리 (100%로 점프)
    clearInterval(progressInterval)
    progress.value = 100
    loadingText.value = '🎉 생성 완료! 이동합니다...'

    // 4. 잠시 대기 후 이동 (사용자가 100%를 볼 시간 줌)
    setTimeout(() => {
      alert(
        `✅ 퀴즈 생성 완료!\n` +
          `📝 제목: ${data.title}\n` +
          `📌 문항 수: ${data.questionCount}개\n` +
          `⏱ 제한시간: ${data.timeLimitMin}분`,
      )
      router.push({ name: 'MyQuiz' })
    }, 1000)

    router.push({ name: 'MyQuiz' })
  } catch (err) {
    // 5. 에러 발생 시 로딩 끄기
    clearInterval(progressInterval)
    isGenerating.value = false // 🔥 여기서 꺼줘야 에러 모달을 볼 수 있음

    console.error('❌ 퀴즈 생성 실패:', err)
    alert('퀴즈 생성 중 오류가 발생했습니다.')
  }
}
</script>

<style scoped>
.inner-shadow {
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-up {
  animation: fade-in-up 0.5s ease-out forwards;
}
</style>
