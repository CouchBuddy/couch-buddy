import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { formatTime } from './utils'

Vue.config.productionTip = false

Vue.filter('time', formatTime)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
