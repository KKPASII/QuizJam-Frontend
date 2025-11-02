<template>
  <div class="min-h-screen flex bg-gray-50 font-['Inter','Noto_Sans_KR',sans-serif]">
    <!-- 왼쪽 소개 영역 -->
    <section
      class="flex-1 bg-green-50 flex flex-col justify-center items-center text-centerpx-10 md:px-20 py-16"
    >
      <div class="max-w-xl">
        <h2 class="text-3xl font-bold text-green-800 mb-2">QuizJam 🎮</h2>
        <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
          PDF 한 장으로 완벽한 학습
        </h1>
        <p class="text-gray-700 text-lg mb-10 leading-relaxed">
          AI가 학습 자료(PDF)를 바탕으로 맞춤형 퀴즈를 자동 생성하고,<br />
          내용 이해를 돕는 퀴즈를 만들어드려요.
        </p>

        <!-- ✅ 기능 카드 영역 -->
        <div class="space-y-4">
          <div
            v-for="(item, i) in features"
            :key="i"
            class="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-start gap-4 hover:shadow-md transition"
          >
            <div
              class="bg-green-100 text-green-600 rounded-full h-10 w-10 flex items-center justify-center"
            >
              <component :is="item.icon" class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-bold text-gray-800 mb-1">{{ item.title }}</h3>
              <p class="text-sm text-gray-600">{{ item.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 오른쪽 로그인 영역 -->
    <section class="flex-1 flex flex-col justify-center items-center px-6 md:px-10 py-8 bg-white">
      <div
        class="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center"
      >
        <h2 class="text-2xl font-bold text-gray-800 mb-3">시작하기</h2>

        <img
          src="https://cdn-icons-png.flaticon.com/512/7069/7069344.png"
          alt="login illustration"
          class="w-24 mx-auto mb-2 object-contain"
        />

        <p class="text-gray-600 mb-5 text-sm">카카오 계정으로 3초 만에 시작하세요</p>

        <button @click="handleLogin" class="w-full flex justify-center items-center">
          <img
            src="https://developers.kakao.com/tool/resource/static/img/button/login/full/ko/kakao_login_large_wide.png"
            alt="카카오 로그인"
            class="w-full h-auto max-w-xs"
          />
        </button>

        <hr class="my-5 border-gray-200" />

        <div class="text-gray-700 text-sm mt-6">
          <p class="font-semibold text-gray-800 mb-3 text-center">
            🎯 로그인하면 이런 걸 할 수 있어요
          </p>

          <div class="space-y-3">
            <div
              class="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 transition rounded-lg px-4 py-2 shadow-sm border border-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4 text-indigo-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span class="text-gray-700">PDF 업로드 및 문제 생성</span>
            </div>

            <div
              class="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 transition rounded-lg px-4 py-2 shadow-sm border border-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4 text-pink-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span class="text-gray-700">AI 맞춤형 퀴즈 생성</span>
            </div>

            <div
              class="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 transition rounded-lg px-4 py-2 shadow-sm border border-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M17 20h5V10H2v10h5m10 0V14a2 2 0 00-2-2H9a2 2 0 00-2 2v6m10 0H7"
                />
              </svg>
              <span class="text-gray-700">친구들과 함께 퀴즈룸 플레이</span>
            </div>

            <div
              class="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 transition rounded-lg px-4 py-2 shadow-sm border border-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4 text-yellow-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 0h6m-9 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span class="text-gray-700">결과 리포트 및 학습 분석</span>
            </div>
          </div>
        </div>

        <p class="text-xs text-gray-400 mt-5">
          로그인 시
          <a href="#" class="text-blue-600 hover:underline">이용약관</a> 및
          <a href="#" class="text-blue-600 hover:underline">개인정보처리방침</a>에 동의한 것으로
          간주됩니다.
        </p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { FileText, Users, BookOpen } from 'lucide-vue-next'
import axios from 'axios'

const router = useRouter()

async function fetchUserInfo() {
  try {
    // ✅ 백엔드에서 HttpOnly 쿠키 인증 기반으로 자동 판별
    const res = await axios.get('http://localhost:8081/api/users/me', {
      withCredentials: true, // 쿠키 포함
    })
    console.log('✅ 로그인된 사용자:', res.data)
    await router.replace('/my-quiz')
  } catch (err) {
    console.log('🚫 로그인되지 않음:', err.response?.status)
  }
}

async function handleLogin() {
  const response = await fetch('http://localhost:8081/api/kakao/login', {
    credentials: 'include',
  })
  const kakaoLoginUrl = await response.text()
  window.location.href = kakaoLoginUrl
}

onMounted(async () => {
  // ✅ 페이지 진입 시, 쿠키 기반 인증 시도
  await fetchUserInfo()
})

// ✅ 기능 카드 데이터 (요청 반영 + 실제 아이콘 적용)
const features = [
  {
    title: 'PDF로 만들기',
    desc: '강의 노트, 논문 등 PDF 파일을 업로드하여 퀴즈를 생성하세요.',
    icon: FileText,
  },
  {
    title: '퀴즈룸 만들기',
    desc: '친구들과 함께 실시간으로 퀴즈를 풀어보세요.',
    icon: Users,
  },
  {
    title: '문제집 추출하기',
    desc: '생성된 퀴즈를 문제집 형태로 다운로드하세요.',
    icon: BookOpen,
  },
]
</script>

<style scoped>
@media (max-width: 768px) {
  .min-h-screen {
    flex-direction: column;
  }
}
</style>
