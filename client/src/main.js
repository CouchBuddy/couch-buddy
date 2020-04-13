import Vue from 'vue'
import VueSK from 'vue-shortkey'

import App from './App.vue'
import router from './router'
import store from './store'
import { formatBytes, formatTime } from './utils'

// Import and automatically register base components
import './components/base'

import 'animate.css'

Vue.config.productionTip = false

Vue.filter('time', formatTime)
Vue.filter('bytes', formatBytes)

Vue.use(VueSK)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
