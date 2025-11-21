<template>
  <div class="flex h-screen bg-gray-50 font-['Inter','Noto_Sans_KR',sans-serif]">
    <aside class="w-64 bg-white border-r border-gray-200 flex flex-col justify-between relative">
      <div>
        <div
          class="px-6 py-5 text-2xl font-extrabold text-green-600 tracking-tight cursor-pointer"
          @click="router.push('/')"
        >
          QuizJam 🎮
        </div>

        <nav class="mt-4 space-y-1">
          <button
            v-for="item in menu"
            :key="item.name"
            @click="router.push(item.path)"
            class="flex items-center w-full text-left px-6 py-3 transition-all"
            :class="
              route.path === item.path
                ? 'bg-green-50 text-green-700 font-bold border-r-4 border-green-600'
                : 'text-gray-700 hover:bg-gray-50'
            "
          >
            <component
              :is="item.icon"
              class="w-5 h-5 mr-3"
              :class="route.path === item.path ? 'text-green-600' : 'text-gray-500'"
            />
            {{ item.name }}
          </button>
        </nav>
      </div>

      <div
        class="border-t border-gray-200 p-5 flex items-center justify-between text-gray-700 relative"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500"
          >
            {{ userName.charAt(0) }}
          </div>
          <p class="font-semibold text-gray-800 text-sm">{{ userName }}</p>
        </div>

        <div class="relative">
          <Settings
            class="w-5 h-5 hover:text-green-600 cursor-pointer transition"
            @click.stop="showMenu = !showMenu"
          />

          <div
            v-if="showMenu"
            class="absolute bottom-8 right-0 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20 animate-fade-in-up"
          >
            <button
              @click="openEditModal"
              class="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 flex items-center gap-2"
            >
              <Edit3 class="w-4 h-4" /> 이름 수정
            </button>
            <div class="border-t border-gray-100"></div>
            <button
              @click="handleLogout"
              class="w-full text-left px-4 py-3 hover:bg-red-50 text-sm text-red-600 flex items-center gap-2"
            >
              <LogOut class="w-4 h-4" /> 로그아웃
            </button>
          </div>
        </div>
      </div>
    </aside>

    <main class="flex-1 overflow-y-auto p-10">
      <router-view />
    </main>

    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm"
    >
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 class="text-lg font-bold text-gray-900 mb-4">사용자 이름 수정</h3>

        <input
          v-model="newNickname"
          type="text"
          class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none mb-6"
          placeholder="새로운 이름을 입력하세요"
        />

        <div class="flex justify-end gap-3">
          <button
            @click="showEditModal = false"
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
          >
            취소
          </button>
          <button
            @click="updateNickname"
            class="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            저장하기
          </button>
        </div>
      </div>
    </div>

    <div v-if="showMenu" @click="showMenu = false" class="fixed inset-0 z-10"></div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'
import { FileText, Users, BookOpen, Settings, LogOut, Edit3 } from 'lucide-vue-next' // 아이콘 추가
import axios from 'axios'

const router = useRouter()
const route = useRoute()

const userName = ref('Guest')

// 🟢 상태 관리 변수들
const showMenu = ref(false) // 설정 메뉴 보임 여부
const showEditModal = ref(false) // 수정 모달 보임 여부
const newNickname = ref('') // 입력할 새 닉네임

const menu = [
  { name: '문제집 생성', path: '/dashboard/create', icon: FileText },
  { name: '퀴즈룸 만들기', path: '/dashboard/room', icon: Users },
  { name: '나의 문제집', path: '/dashboard/my', icon: BookOpen },
]

// ✅ 사용자 정보 가져오기
async function fetchUserInfo() {
  try {
    const response = await axios.get('http://localhost:8081/api/users/me', {
      withCredentials: true,
    })
    userName.value = response.data.nickname || response.data.username || '사용자'
  } catch (error) {
    console.error('사용자 정보 로드 실패:', error)
    userName.value = 'Guest'
    // router.push('/') // 필요시 로그인 페이지로 리다이렉트
  }
}

// ✅ 이름 수정 모달 열기
function openEditModal() {
  newNickname.value = userName.value // 현재 이름으로 초기화
  showEditModal.value = true
  showMenu.value = false // 메뉴 닫기
}

// ✅ 이름 수정 API 호출 (PUT /api/users/me)
async function updateNickname() {
  if (!newNickname.value.trim()) {
    alert('이름을 입력해주세요.')
    return
  }

  try {
    // 1. 요청 보내기
    // 백엔드 UserUpdateRequest가 { nickname: String } 형태여야 함
    const response = await axios.put(
      'http://localhost:8081/api/users/me',
      { nickname: newNickname.value },
      { withCredentials: true },
    )

    // 2. 화면 갱신 (중요: 서버가 돌려준 확실한 값으로 업데이트)
    // UserInfoResponse에 nickname 필드가 있다고 가정
    if (response.data && response.data.nickname) {
      userName.value = response.data.nickname
    } else {
      // 만약 응답에 닉네임이 없다면 내가 입력한 값으로 대체
      userName.value = newNickname.value
    }

    showEditModal.value = false // 모달 닫기
    alert('이름이 변경되었습니다!')
  } catch (error) {
    console.error('이름 수정 실패:', error)
    // 백엔드 유효성 검사(@Valid) 실패 시 메시지 처리
    if (error.response && error.response.status === 400) {
      alert('잘못된 요청입니다. (이름 형식을 확인해주세요)')
    } else {
      alert('이름 수정 중 오류가 발생했습니다.')
    }
  }
}

// ✅ 로그아웃 처리 (POST /logout)
async function handleLogout() {
  if (!confirm('정말 로그아웃 하시겠습니까?')) return

  try {
    // Spring Security 기본 로그아웃 엔드포인트 호출
    await axios.post(
      'http://localhost:8081/api/logout',
      {},
      {
        withCredentials: true,
      },
    )

    alert('로그아웃 되었습니다.')
    router.push('/') // 홈으로 이동
  } catch (error) {
    console.error('로그아웃 실패:', error)
    // 에러가 나더라도 클라이언트 측에서는 로그아웃 처리(이동)하는 게 좋음
    router.push('/')
  }
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style>
/* 메뉴 애니메이션 */
.animate-fade-in-up {
  animation: fadeInUp 0.2s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
