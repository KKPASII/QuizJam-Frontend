<template>
  <div class="flex h-screen bg-gray-50 font-['Inter','Noto_Sans_KR',sans-serif]">
    <!-- ✅ 왼쪽 사이드바 -->
    <aside class="w-64 bg-white border-r border-gray-200 flex flex-col justify-between">
      <div>
        <div class="px-6 py-5 text-2xl font-extrabold text-green-600 tracking-tight">
          QuizJam 🎮
        </div>

        <nav class="mt-4 space-y-1">
          <button
            v-for="item in menu"
            :key="item.name"
            @click="router.push(item.path)"
            class="flex items-center w-full text-left px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-r-xl transition-all"
          >
            <component :is="item.icon" class="w-5 h-5 mr-3 text-gray-500" />
            {{ item.name }}
          </button>
        </nav>
      </div>

      <!-- 사용자 정보 -->
      <div class="border-t border-gray-200 p-5 flex items-center justify-between text-gray-700">
        <div>
          <p class="font-semibold text-gray-800">{{ userName }}</p>
        </div>
        <Settings class="w-5 h-5 hover:text-green-600 cursor-pointer" />
      </div>
    </aside>

    <!-- ✅ 오른쪽에 페이지 표시 영역 -->
    <main class="flex-1 overflow-y-auto p-10">
      <router-view />
      <!-- 여기서 각 페이지가 렌더링됨 -->
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { FileText, Users, BookOpen, Settings } from 'lucide-vue-next'

const router = useRouter()
const userName = ref('Guest')

const menu = [
  { name: '문제집 생성', path: '/quiz/create', icon: FileText },
  { name: '퀴즈룸 만들기', path: '/quiz/room', icon: Users },
  { name: '나의 문제집', path: '/quiz/my', icon: BookOpen },
]
</script>
