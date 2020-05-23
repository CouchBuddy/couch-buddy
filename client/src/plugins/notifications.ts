import Vue from 'vue'
import EventBus from '@/EventBus'

function notify (message: string) {
  EventBus.$emit('notification', { message })
}

function notifyError (message: string) {
  EventBus.$emit('notification', { message, error: true })
}

Vue.prototype.$notify = notify
Vue.prototype.$notifyError = notifyError

export {
  notify,
  notifyError
}
