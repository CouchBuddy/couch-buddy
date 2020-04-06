import Vue from 'vue'
import Vuex from 'vuex'

import client from '@/client'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    isCastConnected: false,
    serverUrl: `${location.protocol}//${location.hostname}:3000`,
    systemInfo: {}
  },
  mutations: {
    setCastConnected (state, payload) {
      state.isCastConnected = payload
    },
    setSystemInfo (state, payload) {
      state.systemInfo = payload

      if (payload.ipAddresses.length) {
        state.serverUrl = `http://${payload.ipAddresses[0]}:3000`
        client.baseURL = state.serverUrl
      }
    }
  },
  actions: {
    async fetchSystemInfo ({ commit }) {
      commit('setSystemInfo', (await client.get('/api/system')).data)
    }
  },
  modules: {
  }
})
