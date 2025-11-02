import axios from 'axios'

export async function createQuiz({ formData }) {
  return axios.post('/api/quiz', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
