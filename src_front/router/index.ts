import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Timer from '../views/Timer.vue'
import ConfForm from '../views/ConfForm.vue'

Vue.use(VueRouter)

  const routes: Array<RouteConfig> = [
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

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
