import Vue from 'vue'
import VueSK from 'vue-shortkey'
import 'animate.css'

import App from './App.vue'
import store from './store'
import { formatBytes, formatTime } from './utils'

// Import and automatically register base components
import './components/base'

// Router is loaded last, so extensions can register routes
import router from './router'

Vue.config.productionTip = false

Vue.filter('time', formatTime)
Vue.filter('bytes', formatBytes)

Vue.use(VueSK)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
