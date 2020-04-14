const isProduction = process.env.NODE_ENV === 'production'

export default {
  castReceiverAppId: null,
  isProduction,
  serverUrl: isProduction ? '/' : `${location.protocol}//${location.hostname}:3000`
}
