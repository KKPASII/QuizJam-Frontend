import axios from 'axios'
import { createRouter, createWebHistory } from 'vue-router'

import SidebarLayout from '@/components/SidebarLayout.vue'
import DashboardRoomView from '@/views/DashboardRoomView.vue'
import HomeView from '@/views/HomeView.vue'
import MyQuizView from '@/views/MyQuizView.vue'
import QuizCreateView from '@/views/QuizCreateView.vue'
import QuizResultView from '@/views/QuizResultView.vue'
import QuizRoomView from '@/views/QuizRoomView.vue'
import QuizView from '@/views/QuizView.vue'
import RoomJoinView from '@/views/RoomJoinView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
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
  {
    path: '/rooms/join/:inviteCode?',
    name: 'room-join',
    component: RoomJoinView,
    props: true,
  },
  {
    path: '/rooms/:roomId',
    name: 'room-play',
    component: QuizRoomView,
    props: true,
  },
  {
    path: '/dashboard',
    component: SidebarLayout,
    meta: { requiresAuth: true },
    children: [
      { path: 'create', name: 'QuizCreate', component: QuizCreateView },
      { path: 'room', name: 'DashboardRoom', component: DashboardRoomView },
      { path: 'my', name: 'MyQuiz', component: MyQuizView },
      { path: '', redirect: '/dashboard/my' },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

async function checkAuth() {
  try {
    await axios.get('/api/users/me', { withCredentials: true })
    return true
  } catch {
    return false
  }
}

router.beforeEach(async (to) => {
  const needsAuth = to.matched.some((record) => record.meta.requiresAuth)
  const isAuth = await checkAuth()

  if (needsAuth && !isAuth) return '/'
  if (to.path === '/' && isAuth) return '/dashboard/create'
  return true
})

export default router
