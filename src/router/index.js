import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'AppMain',
    // component: App
    // lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "AppMain" */ '@/App')
  },
    {
    path: '/tools/status',
    name: 'ServerStatus',
    component: () => import(/* webpackChunkName: "ServerStatus" */ '@/components/tools/status/status')
  },
  {
    path: '*',
    name: 'Error',
    component: () => import(/* webpackChunkName: "Error" */ '@/components/errors/Error'),
    props: route => ({ code: route.query.code })
  }
]

const router = new VueRouter({
  routes
})

export default router
