import axios from 'axios'

class WebSocketSubscriber {
  constructor () {
    this.ws = new WebSocket(`ws://${location.hostname}:3001`)
    this.callbacks = []

    this.ws.onmessage = (evt) => {
      const json = JSON.parse(evt.data)
      this.dispatch(json.event, json.data)
    }

    this.ws.onclose = () => this.dispatch('close', null)
    this.ws.onopen = () => this.dispatch('open', null)
  }

  bind (event, callback) {
    this.callbacks[event] = this.callbacks[event] || []
    this.callbacks[event].push(callback)
    return this
  }

  send (event, data) {
    const payload = JSON.stringify({ event, data })
    this.ws.send(payload)

    return this
  }

  dispatch (event, message) {
    if (typeof this.callbacks[event] === 'undefined') return

    for (const callback of this.callbacks[event]) {
      callback(message)
    }
  }
}

export default axios.create({
  baseURL: `${location.protocol}//${location.hostname}:3000`
})

export const socket = new WebSocketSubscriber()
