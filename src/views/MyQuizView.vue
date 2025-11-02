<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { FileText, Users, BookOpen, Settings } from 'lucide-vue-next'
import axios from 'axios'
import QuizSetupModal from './QuizSetupModal.vue'

const router = useRouter()
const isModalOpen = ref(false)
const isMenuOpen = ref(false)
const userName = ref('Guest')

const menu = [
  { name: '문제집 생성', path: '/quiz/create', icon: FileText },
  { name: '퀴즈룸 만들기', path: '/quiz/room', icon: Users },
  { name: '나의 문제집', path: '/quiz/my', icon: BookOpen },
]

// ✅ 사용자 정보 불러오기
async function fetchUserInfo() {
  try {
    const res = await axios.get('http://localhost:8081/api/users/me', {
      withCredentials: true,
    })
    userName.value = res.data.nickname
  } catch (err) {
    console.error('❌ 사용자 정보 불러오기 실패:', err)
    if (err.response?.status === 401 || err.response?.status === 403) {
      await router.push('/')
    }
  }
}

// ✅ 메뉴 열고닫기
function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

// ✅ 이름 바꾸기
async function changeName() {
  const newName = prompt('새 이름을 입력하세요:', userName.value)
  if (!newName || newName.trim() === '') return

  try {
    await axios.put(
      'http://localhost:8081/api/users/me',
      { nickname: newName },
      { withCredentials: true },
    )
    userName.value = newName
    isMenuOpen.value = false
    alert('이름이 변경되었습니다 ✅')
  } catch (err) {
    console.error('❌ 이름 변경 실패:', err)
    alert('이름 변경 중 오류가 발생했습니다.')
  }
}

// ✅ 로그아웃
async function logout() {
  try {
    await axios.post('http://localhost:8081/api/logout', {}, { withCredentials: true })
    document.cookie = 'accessToken=; Max-Age=0; path=/'
    document.cookie = 'refreshToken=; Max-Age=0; path=/'
    alert('로그아웃 되었습니다 👋')
    await router.push('/')
  } catch (err) {
    console.error('❌ 로그아웃 실패:', err)
    alert('로그아웃 중 오류가 발생했습니다.')
  } finally {
    isMenuOpen.value = false
  }
}

onMounted(fetchUserInfo)
</script>

<template>
  <div class="flex h-screen bg-gray-50 font-['Inter','Noto_Sans_KR',sans-serif]">
    <!-- ✅ 왼쪽 사이드바 -->
    <aside class="w-64 bg-white border-r border-gray-200 flex flex-col justify-between">
      <!-- 메뉴 상단 -->
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

      <!-- ✅ 사용자 정보 -->
      <div class="border-t border-gray-200 p-5 flex items-center justify-between relative">
        <div>
          <p class="font-semibold text-gray-800">{{ userName }}</p>
        </div>

        <!-- ⚙️ 설정 아이콘 (lucide Settings 사용) -->
        <button @click="toggleMenu" class="hover:text-green-600 relative">
          <Settings class="w-5 h-5 text-gray-600 hover:text-green-600 transition" />
        </button>

        <!-- ⚙️ 드롭다운 메뉴 -->
        <div
          v-if="isMenuOpen"
          class="absolute bottom-14 right-4 w-40 bg-white border border-gray-200 shadow-lg rounded-lg py-2 z-50"
        >
          <button
            @click="changeName"
            class="block w-full text-left px-4 py-2 text-gray-700 hover:bg-green-50"
          >
            ✏️ 이름 바꾸기
          </button>
          <button
            @click="logout"
            class="block w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50"
          >
            🚪 로그아웃
          </button>
        </div>
      </div>
    </aside>

    <!-- ✅ 오른쪽 메인 영역 -->
    <main class="flex-1 overflow-y-auto p-10">
      <QuizSetupModal :isOpen="isModalOpen" @close="isModalOpen = false" @submit="handleSubmit" />
    </main>
  </div>
</template>

<style scoped>
aside {
  min-height: 100vh;
}
</style>
