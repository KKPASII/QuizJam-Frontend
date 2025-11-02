import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import './assets/tailwind.css'

// 기본 API URL 설정 (Spring Boot 서버 주소)
axios.defaults.baseURL = 'http://localhost:8081'
axios.defaults.withCredentials = true

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.config.globalProperties.$axios = axios
app.mount('#app')
