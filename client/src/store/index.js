import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    isCastConnected: false
  },
  mutations: {
    setCastConnected (state, payload) {
      state.isCastConnected = payload
    }
  },
  actions: {
  },
  modules: {
  }
})
