export default {
  state: {
    menu: [
      { to: 'home', icon: 'mdi-sofa', shortkey: [ 'ctrl', 'h' ], order: 0 },
      { to: 'downloads', icon: 'mdi-download', shortkey: [ 'ctrl', 'd' ], order: 10 },
      { to: 'search', icon: 'mdi-magnify', shortkey: [ 'ctrl', 'f' ], order: 20 },
      { to: 'settings', icon: 'mdi-cog', order: 50 }
    ],
    routes: []
  },

  mutations: {
    addMenuItem (state, item) {
      state.menu = [ ...state.menu, item ].sort((a, b) => a.order - b.order)
    },
    addRoute (state, route) {
      state.routes = [ ...state.routes, route ]
    }
  },

  namespaced: true
}
