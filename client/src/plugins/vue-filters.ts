import Vue from 'vue'

Vue.filter('time', formatTime)
Vue.filter('bytes', formatBytes)

/**
 * Format time into a human readable string like 1h 20m 30s
 *
 * @param time time in seconds
 * @param colonsOrLetters true for letters, false for colons (default)
 */
export function formatTime (time: number, colonsOrLetters: boolean = false) {
  const hours = Math.floor(time / 3600)
  const minutes = Math.floor((time - (hours * 3600)) / 60)
  const seconds = Math.round(time - (hours * 3600) - (minutes * 60))

  const minutesFmt = minutes.toString().padStart(2, '0')
  const secondsFmt = seconds.toString().padStart(2, '0')

  return colonsOrLetters
    ? `${hours}h ${minutesFmt}m ${secondsFmt}s`
    : `${hours}:${minutesFmt}:${secondsFmt}`
}

export function formatBytes (bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = [ 'Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB' ]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}
