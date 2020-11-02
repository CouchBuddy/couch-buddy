import { URL } from 'url'

export function removeFileExtension (fileName: string): string {
  return fileName.replace(/\.[^/.]+$/, '')
}

export function getTmdbImageUrl (path: string) {
  return `http://image.tmdb.org/t/p/w500${path}`
}

export function isValidURL (url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
