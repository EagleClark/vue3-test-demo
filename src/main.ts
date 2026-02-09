import { createApp } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'

import HomeView from './components/Home.vue'
import FormView from './components/Form.vue'
import CalculateView from './components/Calculate.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/form', component: FormView },
  { path: '/calculate', component: CalculateView },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

const app = createApp(App)

app.use(ElementPlus)
app.use(router)
app.mount('#app')
