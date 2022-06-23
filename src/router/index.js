import Vue from 'vue'
import VueRouter from 'vue-router'
import ServerStatus from "@/views/serverStatus";

Vue.use(VueRouter)

const routes = [
  {
    path: '/tools/status',
    name: 'Server Status',
    component: ServerStatus
  }
]

const router = new VueRouter({
  routes
})

export default router
