import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Timer from '../views/Timer.vue'
import ConfForm from '../views/ConfForm.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: ConfForm
  },
  {
    path: '/timer/:id',
    name: 'timer',
	component: Timer,
	props:true,
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
