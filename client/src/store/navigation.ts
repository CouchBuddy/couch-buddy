export default {
  state: {
    menu: [
      { to: 'home', name: 'Home', icon: 'mdi-sofa', shortkey: [ 'ctrl', 'h' ], order: 0 },
      { to: 'search', name: 'Search', icon: 'mdi-magnify', shortkey: [ 'ctrl', 'f' ], order: 10 },
      { to: 'explore', name: 'Explore', icon: 'mdi-compass', shortkey: [ 'ctrl', 'e' ], order: 20 },
      { to: 'downloads', name: 'Downloads', icon: 'mdi-download', shortkey: [ 'ctrl', 'd' ], order: 30 },
      { to: 'settings', name: 'Settings', icon: 'mdi-cog', order: 50 }
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
