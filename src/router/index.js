import Vue from 'vue'
import VueRouter from 'vue-router'
import ServerStatus from "@/components/tools/status/status"
import App from "@/App";
import Error from "@/components/errors/Error";

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
  },
  {
    path: '*',
    name: 'Error',
    component: Error,
    props: route => ({ code: route.query.code })
  }
]

const router = new VueRouter({
  routes
})

export default router
