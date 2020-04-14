import Vue from 'vue'
import VueSK from 'vue-shortkey'
import 'animate.css'

import App from './App.vue'
import store from './store'
import { formatBytes, formatTime } from './utils'

// Import and automatically register base components
import './components/base'

import extensionsManager from './extensions'

// Router is loaded last, so extensions can register routes
import createRouter from './router'

Vue.config.productionTip = false

Vue.filter('time', formatTime)
Vue.filter('bytes', formatBytes)

Vue.use(VueSK)

async function init () {
  await extensionsManager.loadExtensions()
  const router = createRouter()

  new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount('#app')
}

init()
