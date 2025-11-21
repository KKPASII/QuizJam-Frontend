<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

// 상태 관리
const quizzes = ref([])
const page = ref(0)
const totalPages = ref(1)
const loading = ref(false)
const deleting = ref(false)

// ✅ 퀴즈 목록 불러오기
async function fetchQuizzes() {
  loading.value = true
  try {
    const res = await axios.get(`http://localhost:8081/api/quizzes/me`, {
      params: { page: page.value, size: 8 },
      withCredentials: true,
    })
    // 백엔드 Page<QuizResponse>의 구조: content 배열 안에 데이터가 있음
    quizzes.value = res.data.content ?? []
    totalPages.value = res.data.totalPages ?? 1
  } catch (err) {
    console.error('❌ 퀴즈 목록 불러오기 실패:', err)
    alert('퀴즈 목록을 불러오는 중 오류가 발생했습니다.')
  } finally {
    loading.value = false
  }
}

// ✅ 퀴즈 삭제 (quizId 사용)
async function deleteQuiz(quizId, quizTitle) {
  if (!confirm(`'${quizTitle}' 문제집을 삭제할까요?`)) return

  deleting.value = true
  try {
    // 삭제 API 호출
    await axios.delete(`http://localhost:8081/api/quizzes/${quizId}`, {
      withCredentials: true,
    })

    // 목록에서 제거 (quiz.quizId로 비교)
    quizzes.value = quizzes.value.filter((q) => q.quizId !== quizId)
    alert('삭제되었습니다.')
  } catch (err) {
    console.error('❌ 퀴즈 삭제 실패:', err)
    alert('삭제 중 오류가 발생했습니다.')
  } finally {
    deleting.value = false
  }
}

// ✅ 퀴즈 보기 페이지 이동 (여기서 quizId를 넘김)
function openQuiz(quizId) {
  // 라우터 설정에 '/quiz/:id' 가 있어야 함
  router.push(`/quiz/${quizId}`)
}

// 페이지네이션
function prevPage() {
  if (page.value > 0) {
    page.value--
    fetchQuizzes()
  }
}

function nextPage() {
  if (page.value < totalPages.value - 1) {
    page.value++
    fetchQuizzes()
  }
}

onMounted(fetchQuizzes)
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-gray-800">📚 나의 문제집</h2>

    <div v-if="loading" class="text-center py-10 text-gray-500">문제집을 불러오는 중...</div>

    <div v-else-if="!quizzes.length" class="text-center py-10 text-gray-500 bg-gray-50 rounded-xl">
      아직 생성한 문제집이 없습니다. 퀴즈를 만들어보세요!
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="quiz in quizzes"
        :key="quiz.quizId"
        class="relative p-6 bg-white shadow-sm rounded-xl border border-gray-200 hover:border-green-400 hover:shadow-md transition flex flex-col justify-between h-48 group"
      >
        <div class="cursor-pointer h-full" @click="openQuiz(quiz.quizId)">
          <div class="mb-2">
            <span class="px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-md">
              {{ quiz.type }}
            </span>
            <span class="ml-2 text-xs text-gray-400">
              {{ quiz.difficulty }}
            </span>
          </div>

          <p class="text-lg font-bold text-gray-800 line-clamp-2 mb-2">
            {{ quiz.title }}
          </p>

          <div class="text-sm text-gray-500 space-y-1">
            <p>📝 {{ quiz.questionCount }} 문제</p>
            <p>⏱️ {{ quiz.timeLimitMin }}분</p>
          </div>
        </div>

        <button
          @click.stop="deleteQuiz(quiz.quizId, quiz.title)"
          class="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
          :disabled="deleting"
          title="문제집 삭제"
        >
          <span class="material-icons">delete</span> 🗑️
        </button>
      </div>
    </div>

    <div v-if="totalPages > 1" class="flex justify-center items-center mt-8 space-x-4">
      <button
        @click="prevPage"
        :disabled="page === 0 || loading"
        class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition"
      >
        이전
      </button>

      <span class="font-medium text-gray-700">{{ page + 1 }} / {{ totalPages }}</span>

      <button
        @click="nextPage"
        :disabled="page >= totalPages - 1 || loading"
        class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition"
      >
        다음
      </button>
    </div>
  </div>
</template>
