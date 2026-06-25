import axios from 'axios'

const API_BASE_URL = '/api/quizzes'

export function createQuiz(formData) {
  return axios.post(API_BASE_URL, formData, {
    withCredentials: true,
  })
}

export function getMyQuizzes({ page = 0, size = 8 } = {}) {
  return axios.get(API_BASE_URL + '/me', {
    params: { page, size },
    withCredentials: true,
  })
}

export function getQuizById(quizId) {
  return axios.get(API_BASE_URL + '/' + quizId, {
    withCredentials: true,
  })
}

export function getQuizQuestions(quizId) {
  return axios.get(API_BASE_URL + '/' + quizId + '/questions', {
    withCredentials: true,
  })
}

export function getQuizAnswers(quizId) {
  return axios.get(API_BASE_URL + '/' + quizId + '/answers', {
    withCredentials: true,
  })
}

export function deleteQuiz(quizId) {
  return axios.delete(API_BASE_URL + '/' + quizId, {
    withCredentials: true,
  })
}
