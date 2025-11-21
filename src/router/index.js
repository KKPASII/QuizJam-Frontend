import { createRouter, createWebHistory } from 'vue-router'
import axios from 'axios'

import HomeView from '@/views/HomeView.vue'
import QuizView from '@/views/QuizView.vue'
import QuizResultView from '@/views/QuizResultView.vue'
import QuizCompetitionView from '@/views/QuizCompetitionView.vue'

import SidebarLayout from '@/components/SidebarLayout.vue'
import QuizCreateView from '@/views/QuizCreateView.vue'
import QuizRoomView from '@/views/QuizRoomView.vue'
import MyQuizView from '@/views/MyQuizView.vue'

const routes = [
  // 🏠 홈
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },

  // 🧩 퀴즈 플레이 관련
  {
    path: '/quiz/:id',
    name: 'quiz-view',
    component: QuizView,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/quiz/:id/result',
    name: 'quiz-result',
    component: QuizResultView,
    props: true,
    meta: { requiresAuth: true },
  },

  // ⚔️ 대회 모드
  {
    path: '/competition',
    name: 'competition',
    component: QuizCompetitionView,
    meta: { requiresAuth: true },
  },

  // 📚 사이드바 레이아웃 (문제집, 퀴즈룸, 나의 문제집)
  {
    path: '/dashboard',
    component: SidebarLayout,
    meta: { requiresAuth: true },
    children: [
      { path: 'create', name: 'QuizCreate', component: QuizCreateView },
      { path: 'room', name: 'QuizRoom', component: QuizRoomView },
      { path: 'my', name: 'MyQuiz', component: MyQuizView },
      { path: '', redirect: '/dashboard/my' }, // 기본 진입시 '나의 문제집'으로
    ],
  },

  // ❌ 잘못된 경로 → 홈으로 리다이렉트
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

// ✅ createRouter
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// ✅ 인증 확인 함수
async function checkAuth() {
  try {
    await axios.get('http://localhost:8081/api/users/me', { withCredentials: true })
    return true
  } catch {
    return false
  }
}

// ✅ 라우터 가드
router.beforeEach(async (to, from, next) => {
  const isAuth = await checkAuth()

  // 로그인 안 돼 있고 인증 필요한 페이지 접근 시 → 홈으로
  if (to.meta.requiresAuth && !isAuth) {
    console.warn('🚫 인증 필요 - 홈으로 리다이렉트')
    next('/')
  }
  // 로그인된 상태에서 홈('/') 진입 시 → 대시보드(문제집 생성)로 이동
  else if (to.path === '/' && isAuth) {
    console.log('✅ 이미 로그인됨 - 대시보드로 이동')
    next('/dashboard/create')
  }
  // 정상 이동
  else {
    next()
  }
})

export default router
