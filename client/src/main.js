import Vue from 'vue'
import VueSK from 'vue-shortkey'
import 'animate.css'

import App from './App.vue'
import store from './store'
import './plugins'
// Import and automatically register base components
import './components/base'
// Router is loaded last
import createRouter from './router'

Vue.config.productionTip = false

Vue.use(VueSK)

new Vue({
  router: createRouter(),
  store,
  render: h => h(App)
}).$mount('#app')
