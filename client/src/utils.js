export function formatTime (time) {
  const hours = Math.floor(time / 3600)
  let minutes = Math.floor((time - (hours * 3600)) / 60)
  let seconds = Math.round(time - (hours * 3600) - (minutes * 60))

  minutes = minutes.toString().padStart(2, '0')
  seconds = seconds.toString().padStart(2, '0')

  return `${hours}:${minutes}:${seconds}`
}
