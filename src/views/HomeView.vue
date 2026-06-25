<template>
  <div class="min-h-screen bg-slate-50 font-['Inter','Noto_Sans_KR',sans-serif]">
    <main class="grid min-h-screen lg:grid-cols-[1.12fr_0.88fr]">
      <section
        class="relative flex items-center overflow-hidden bg-[url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center px-6 py-12 sm:px-10 lg:px-16"
      >
        <div class="absolute inset-0 bg-emerald-950/72"></div>

        <div class="relative z-10 w-full max-w-3xl text-white">
          <div class="mb-7 inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm font-bold ring-1 ring-white/20 backdrop-blur">
            <Sparkles class="h-4 w-4 text-emerald-200" />
            PDF 기반 AI 퀴즈 플랫폼
          </div>

          <h1 class="max-w-2xl text-5xl font-extrabold leading-tight sm:text-6xl">
            QuizJam
          </h1>
          <p class="mt-5 max-w-2xl text-xl font-semibold leading-8 text-emerald-50">
            학습 자료를 문제지로 만들고, 친구들과 실시간 퀴즈룸에서 바로 겨뤄보세요.
          </p>

          <div class="mt-10 grid gap-4 sm:grid-cols-3">
            <div
              v-for="stat in stats"
              :key="stat.label"
              class="rounded-2xl border border-white/15 bg-white/12 p-5 backdrop-blur"
            >
              <p class="text-3xl font-extrabold">{{ stat.value }}</p>
              <p class="mt-1 text-sm font-medium text-emerald-50">{{ stat.label }}</p>
            </div>
          </div>

          <div class="mt-10 grid gap-4">
            <div
              v-for="item in features"
              :key="item.title"
              class="flex items-start gap-4 rounded-2xl border border-white/15 bg-white/12 p-5 shadow-xl shadow-black/10 backdrop-blur"
            >
              <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700">
                <component :is="item.icon" class="h-5 w-5" />
              </div>
              <div>
                <h2 class="font-bold text-white">{{ item.title }}</h2>
                <p class="mt-1 text-sm leading-6 text-emerald-50">{{ item.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="flex items-center justify-center bg-white px-6 py-10">
        <div class="w-full max-w-md">
          <div class="mb-8 text-center">
            <div class="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50">
              <img
                src="https://cdn-icons-png.flaticon.com/512/7069/7069344.png"
                alt=""
                class="h-14 w-14 object-contain"
              />
            </div>
            <h2 class="text-3xl font-extrabold text-gray-950">시작하기</h2>
            <p class="mt-3 text-sm leading-6 text-gray-600">
              카카오 계정으로 로그인하고 문제지 생성부터 퀴즈룸 진행까지 한 번에 관리하세요.
            </p>
          </div>

          <button
            type="button"
            class="mx-auto flex w-full items-center justify-center rounded-xl focus:outline-none focus-visible:outline-none"
            @click="handleLogin"
          >
            <img
              src="https://developers.kakao.com/tool/resource/static/img/button/login/full/ko/kakao_login_large_wide.png"
              alt="카카오 로그인"
              class="h-auto w-full"
            />
          </button>

          <div class="my-8 flex items-center gap-3">
            <div class="h-px flex-1 bg-gray-200"></div>
            <span class="text-xs font-bold uppercase tracking-wide text-gray-400">QuizJam으로 할 수 있는 것</span>
            <div class="h-px flex-1 bg-gray-200"></div>
          </div>

          <div class="grid gap-3">
            <div
              v-for="item in benefits"
              :key="item.title"
              class="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
            >
              <component :is="item.icon" class="h-5 w-5 text-emerald-600" />
              <div>
                <p class="text-sm font-bold text-gray-900">{{ item.title }}</p>
                <p class="text-xs text-gray-500">{{ item.desc }}</p>
              </div>
            </div>
          </div>

          <p class="mt-7 text-center text-xs leading-5 text-gray-400">
            로그인하면 서비스 이용약관 및 개인정보 처리방침에 동의한 것으로 간주됩니다.
          </p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { BookOpen, FileText, Sparkles, Trophy, Users } from 'lucide-vue-next'
import axios from 'axios'

const router = useRouter()
const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || 'http://localhost:8081'

const stats = [
  { value: 'PDF', label: '자료 업로드' },
  { value: 'AI', label: '문제 자동 생성' },
  { value: 'LIVE', label: '실시간 퀴즈룸' },
]

const features = [
  {
    title: 'PDF로 문제지 만들기',
    desc: '강의 노트와 학습 자료를 올리면 객관식, 단답형, OX 문제를 생성합니다.',
    icon: FileText,
  },
  {
    title: '친구들과 퀴즈룸 플레이',
    desc: '초대 코드로 참가자를 모으고 STOMP 기반 실시간 진행을 공유합니다.',
    icon: Users,
  },
  {
    title: '결과와 해설로 복습',
    desc: '내 답안과 정답, 해설을 비교해 틀린 내용을 바로 확인합니다.',
    icon: BookOpen,
  },
]

const benefits = [
  { title: '문제지 저장', desc: '생성한 퀴즈를 내 목록에서 관리', icon: BookOpen },
  { title: '퀴즈룸 초대', desc: '코드와 링크로 빠르게 참여', icon: Users },
  { title: '점수 경쟁', desc: '실시간 제출과 순위 확인', icon: Trophy },
]

async function handleLogin() {
  try {
    const response = await fetch(API_ORIGIN + '/api/kakao/login', {
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Failed to request Kakao login URL')
    }

    const kakaoLoginUrl = (await response.text()).trim()
    if (!kakaoLoginUrl) {
      throw new Error('Empty Kakao login URL')
    }

    window.location.assign(kakaoLoginUrl)
  } catch (error) {
    console.error('카카오 로그인 URL 요청 실패:', error)
    alert('카카오 로그인 요청에 실패했습니다. 백엔드 서버와 카카오 설정을 확인해주세요.')
  }
}

onMounted(async () => {
  try {
    await axios.get('/api/users/me', { withCredentials: true })
    await router.replace('/dashboard/create')
  } catch {
    // 로그인 전에는 홈 화면을 유지합니다.
  }
})
</script>
