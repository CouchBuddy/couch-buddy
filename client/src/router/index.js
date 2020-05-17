import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from '@/views/Home.vue'
import MainLayout from '@/components/MainLayout'
import store from '@/store'

Vue.use(VueRouter)

const getRoutes = () => [
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
        path: '/movie/:id/edit',
        name: 'movie-edit',
        component: () => import(/* webpackChunkName: "movie-edit" */ '@/views/MovieEdit.vue')
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
        path: '/explore',
        name: 'explore',
        component: () => import(/* webpackChunkName: "explore" */ '@/views/Explore.vue')
      },
      {
        path: '/settings',
        name: 'settings',
        component: () => import(/* webpackChunkName: "settings" */ '@/views/Settings.vue')
      },
      ...store.state.navigation.routes
    ]
  },
  {
    path: '/watch/:id',
    name: 'watch',
    component: () => import(/* webpackChunkName: "watch" */ '@/views/Watch.vue')
  }
]

export default function () {
  return new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: getRoutes()
  })
}
