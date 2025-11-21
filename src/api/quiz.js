// src/api/quiz.js
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8081/api/quizzes'

/**
 * 🧩 퀴즈 생성 API
 */
export async function createQuiz(formData) {
  return axios.post(API_BASE_URL, formData, {
    headers: {
      'Content-Type': undefined, // 브라우저가 boundary 자동 생성
    },
    withCredentials: true, // ✅ 쿠키 포함 (로그인 세션 유지용)
  })
}

/**
 * 📚 내 퀴즈 목록 조회
 */
export async function getMyQuizzes({ page = 0, size = 8 }) {
  return axios.get(`${API_BASE_URL}/me?page=${page}&size=${size}`, {
    withCredentials: true,
  })
}

/**
 * ❓ 퀴즈 문제 목록 조회
 * GET /api/quizzes/{id}/questions
 */
export async function getQuizQuestions(quizId) {
  return axios.get(`${API_BASE_URL}/${quizId}/questions`, {
    withCredentials: true,
  })
}

/**
 * ❓ 퀴즈 정답 조회
 * GET /api/quizzes/{id}/questions
 */
export async function getQuizAnswers(quizId) {
  return axios.get(`${API_BASE_URL}/${quizId}/answers`, {
    withCredentials: true,
  })
}

/**
 * 🧠 퀴즈 단건 조회
 */
export async function getQuizById(quizId) {
  return axios.get(`${API_BASE_URL}/${quizId}`, {
    withCredentials: true,
  })
}

/**
 * ❌ 퀴즈 삭제
 */
export async function deleteQuiz(quizId) {
  return axios.delete(`${API_BASE_URL}/${quizId}`, {
    withCredentials: true,
  })
}
