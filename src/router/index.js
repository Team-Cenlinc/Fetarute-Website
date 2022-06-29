import Vue from 'vue'
import VueRouter from 'vue-router'
import ServerStatus from "@/components/tools/status/status"
import App from "@/App";

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'AppMain',
    component: App
  },
    {
    path: '/tools/status',
    name: 'ServerStatus',
    component: ServerStatus
  }
]

const router = new VueRouter({
  routes
})

export default router
