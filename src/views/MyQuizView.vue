<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">내 문제지</h1>
        <p class="mt-1 text-sm text-gray-600">생성한 퀴즈를 풀거나 퀴즈룸에서 사용할 수 있습니다.</p>
      </div>
      <button
        type="button"
        class="rounded-xl bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
        @click="router.push('/dashboard/create')"
      >
        새 문제지
      </button>
    </div>

    <div v-if="loading" class="rounded-xl bg-white py-12 text-center text-gray-500 shadow-sm">
      문제지를 불러오는 중...
    </div>

    <div v-else-if="!quizzes.length" class="rounded-xl border border-dashed border-gray-300 bg-white py-14 text-center">
      <p class="font-semibold text-gray-800">아직 생성한 문제지가 없습니다.</p>
      <p class="mt-2 text-sm text-gray-500">PDF를 올려 첫 문제지를 만들어보세요.</p>
    </div>

    <div v-else class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="quiz in quizzes"
        :key="quiz.quizId"
        class="flex min-h-52 flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-green-400 hover:shadow-md"
      >
        <div>
          <div class="mb-3 flex items-center gap-2">
            <span class="rounded-md bg-green-50 px-2 py-1 text-xs font-bold text-green-700">
              {{ quiz.type }}
            </span>
            <span class="text-xs font-medium text-gray-400">{{ quiz.difficulty }}</span>
          </div>
          <h2 class="line-clamp-2 text-lg font-bold text-gray-900">{{ quiz.title }}</h2>
          <div class="mt-4 space-y-1 text-sm text-gray-500">
            <p>{{ quiz.questionCount }}문제</p>
            <p>제한 시간 {{ quiz.timeLimitMin }}분</p>
          </div>
        </div>

        <div class="mt-5 flex items-center gap-2">
          <button
            type="button"
            class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            @click="router.push('/quiz/' + quiz.quizId)"
          >
            <Play class="h-4 w-4" />
            풀기
          </button>
          <button
            type="button"
            class="rounded-lg border border-gray-200 p-2 text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            title="삭제"
            :disabled="deleting"
            @click="removeQuiz(quiz)"
          >
            <Trash2 class="h-5 w-5" />
          </button>
        </div>
      </article>
    </div>

    <div v-if="totalPages > 1" class="flex items-center justify-center gap-4">
      <button
        type="button"
        class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        :disabled="page === 0 || loading"
        @click="movePage(page - 1)"
      >
        이전
      </button>
      <span class="font-semibold text-gray-700">{{ page + 1 }} / {{ totalPages }}</span>
      <button
        type="button"
        class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        :disabled="page >= totalPages - 1 || loading"
        @click="movePage(page + 1)"
      >
        다음
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Play, Trash2 } from 'lucide-vue-next'
import { deleteQuiz, getMyQuizzes } from '@/api/quiz'

const router = useRouter()

const quizzes = ref([])
const page = ref(0)
const totalPages = ref(1)
const loading = ref(false)
const deleting = ref(false)

async function fetchQuizzes() {
  loading.value = true
  try {
    const response = await getMyQuizzes({ page: page.value, size: 8 })
    quizzes.value = response.data.content || []
    totalPages.value = response.data.totalPages || 1
  } catch (error) {
    console.error('문제지 목록 조회 실패:', error)
    alert('문제지 목록을 불러오지 못했습니다.')
  } finally {
    loading.value = false
  }
}

async function removeQuiz(quiz) {
  if (!confirm("'" + quiz.title + "' 문제지를 삭제할까요?")) return

  deleting.value = true
  try {
    await deleteQuiz(quiz.quizId)
    quizzes.value = quizzes.value.filter((item) => item.quizId !== quiz.quizId)
  } catch (error) {
    console.error('문제지 삭제 실패:', error)
    alert('삭제 중 오류가 발생했습니다.')
  } finally {
    deleting.value = false
  }
}

function movePage(nextPage) {
  page.value = nextPage
  fetchQuizzes()
}

onMounted(fetchQuizzes)
</script>
