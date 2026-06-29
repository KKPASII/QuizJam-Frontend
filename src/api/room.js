import axios from 'axios'

const API_BASE_URL = '/api/rooms'

export function createRoom({ quizId, questionTimeLimitSeconds }) {
  return axios.post(
    API_BASE_URL,
    { quizId, questionTimeLimitSeconds },
    { withCredentials: true },
  )
}

export function getRoom(roomId) {
  return axios.get(API_BASE_URL + '/' + roomId, {
    withCredentials: true,
  })
}

export function getRoomByInviteCode(inviteCode) {
  return axios.get(API_BASE_URL + '/code/' + inviteCode, {
    withCredentials: true,
  })
}

export function joinRoom({ inviteCode, nickname }) {
  return axios.post(
    API_BASE_URL + '/join',
    { inviteCode, nickname },
    { withCredentials: true },
  )
}

export function startRoom(roomId) {
  return axios.put(API_BASE_URL + '/' + roomId + '/start', null, {
    withCredentials: true,
  })
}

export function deleteRoom(roomId) {
  return axios.delete(API_BASE_URL + '/' + roomId, {
    withCredentials: true,
  })
}
