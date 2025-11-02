<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center py-10">
    <div class="max-w-3xl w-full bg-white shadow-xl rounded-2xl p-8">
      <h1 class="text-3xl font-bold text-indigo-700 mb-6 text-center">{{ title }} 결과 🎯</h1>

      <div v-for="(r, i) in results" :key="i" class="border-b pb-4 mb-4">
        <p class="font-semibold">{{ i + 1 }}. {{ r.question }}</p>
        <p class="text-gray-700 mt-1">
          내 답변: <b>{{ r.userAnswer || '미응답' }}</b>
        </p>
        <p class="text-green-600" v-if="r.isCorrect">✅ 정답!</p>
        <p class="text-red-600" v-else>❌ 정답은 {{ r.correctAnswer }}</p>
      </div>

      <div class="text-center mt-6">
        <p class="text-lg font-bold">총 점수: {{ score }} / {{ results.length }}</p>
        <button
          @click="router.push('/')"
          class="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg"
        >
          홈으로
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const results = ref([])
const score = ref(0)
const title = ref('')

onMounted(() => {
  if (route.query.result) {
    results.value = JSON.parse(route.query.result)
    title.value = route.query.title
    score.value = results.value.filter((r) => r.isCorrect).length
  }
})
</script>
