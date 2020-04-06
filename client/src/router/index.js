import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/views/Home.vue'
import MainLayout from '@/components/MainLayout'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '/',
        name: 'home',
        component: Home
      },
      {
        path: '/movie/:id',
        name: 'movie',
        component: () => import(/* webpackChunkName: "movie" */ '@/views/Movie.vue')
      },
      {
        path: '/downloads',
        name: 'downloads',
        component: () => import(/* webpackChunkName: "downloads" */ '@/views/Downloads.vue')
      },
      {
        path: '/search',
        name: 'search',
        component: () => import(/* webpackChunkName: "search" */ '@/views/Search.vue')
      },
      {
        path: '/settings',
        name: 'settings',
        component: () => import(/* webpackChunkName: "settings" */ '@/views/Settings.vue')
      }
    ]
  },
  {
    path: '/watch/:id',
    name: 'watch',
    component: () => import(/* webpackChunkName: "watch" */ '@/views/Watch.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
