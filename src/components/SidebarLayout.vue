<template>
  <div class="flex min-h-screen bg-gray-50 font-['Inter','Noto_Sans_KR',sans-serif]">
    <aside class="flex w-64 shrink-0 flex-col justify-between border-r border-gray-200 bg-white">
      <div>
        <button
          type="button"
          class="block px-6 py-5 text-left text-2xl font-extrabold tracking-tight text-green-600"
          @click="router.push('/dashboard/create')"
        >
          QuizJam
        </button>

        <nav class="mt-3 space-y-1">
          <button
            v-for="item in menu"
            :key="item.name"
            type="button"
            class="flex w-full items-center px-6 py-3 text-left transition"
            :class="
              route.path === item.path
                ? 'border-r-4 border-green-600 bg-green-50 font-bold text-green-700'
                : 'text-gray-700 hover:bg-gray-50'
            "
            @click="router.push(item.path)"
          >
            <component
              :is="item.icon"
              class="mr-3 h-5 w-5"
              :class="route.path === item.path ? 'text-green-600' : 'text-gray-500'"
            />
            {{ item.name }}
          </button>
        </nav>
      </div>

      <div class="border-t border-gray-200 p-5">
        <div class="flex items-center justify-between">
          <div class="flex min-w-0 items-center gap-3">
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
              {{ userInitial }}
            </div>
            <p class="truncate text-sm font-semibold text-gray-900">{{ userName }}</p>
          </div>

          <button
            type="button"
            class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-green-700"
            title="설정"
            @click.stop="showMenu = !showMenu"
          >
            <Settings class="h-5 w-5" />
          </button>
        </div>

        <div v-if="showMenu" class="mt-3 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
          <button
            type="button"
            class="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50"
            @click="openEditModal"
          >
            <Edit3 class="h-4 w-4" />
            이름 수정
          </button>
          <button
            type="button"
            class="flex w-full items-center gap-2 border-t border-gray-100 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
            @click="handleLogout"
          >
            <LogOut class="h-4 w-4" />
            로그아웃
          </button>
        </div>
      </div>
    </aside>

    <main class="flex-1 overflow-y-auto p-8">
      <router-view />
    </main>

    <div
      v-if="showEditModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
    >
      <form class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" @submit.prevent="updateNickname">
        <h2 class="mb-4 text-lg font-bold text-gray-900">이름 수정</h2>
        <input
          v-model="newNickname"
          type="text"
          class="mb-6 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
          placeholder="새 이름을 입력하세요"
        />
        <div class="flex justify-end gap-3">
          <button
            type="button"
            class="rounded-lg px-4 py-2 font-medium text-gray-600 hover:bg-gray-100"
            @click="showEditModal = false"
          >
            취소
          </button>
          <button type="submit" class="rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700">
            저장
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BookOpen, Edit3, FileText, LogOut, Settings, Users } from 'lucide-vue-next'
import axios from 'axios'

const router = useRouter()
const route = useRoute()

const userName = ref('Guest')
const showMenu = ref(false)
const showEditModal = ref(false)
const newNickname = ref('')

const menu = [
  { name: '문제지 생성', path: '/dashboard/create', icon: FileText },
  { name: '퀴즈룸', path: '/dashboard/room', icon: Users },
  { name: '내 문제지', path: '/dashboard/my', icon: BookOpen },
]

const userInitial = computed(() => userName.value?.charAt(0)?.toUpperCase() || 'G')

async function fetchUserInfo() {
  try {
    const response = await axios.get('/api/users/me', { withCredentials: true })
    userName.value = response.data.nickname || response.data.username || '사용자'
  } catch {
    userName.value = 'Guest'
  }
}

function openEditModal() {
  newNickname.value = userName.value
  showEditModal.value = true
  showMenu.value = false
}

async function updateNickname() {
  const nickname = newNickname.value.trim()
  if (!nickname) {
    alert('이름을 입력해주세요.')
    return
  }

  try {
    const response = await axios.put('/api/users/me', { nickname }, { withCredentials: true })
    userName.value = response.data.nickname || nickname
    showEditModal.value = false
  } catch {
    alert('이름 수정 중 오류가 발생했습니다.')
  }
}

async function handleLogout() {
  try {
    await axios.post('/api/logout', {}, { withCredentials: true })
  } finally {
    await router.push('/')
  }
}

onMounted(fetchUserInfo)
</script>
