import path from 'path'
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

/**
 * Given a relative path, it returns its absolute path starting from
 * the `server/` folder. If the input path is already absolute, it
 * returns it.
 * 
 * @param relativePath the path
 * @returns 
 */
 export function getAbsolutePath (relativePath: string) {
  if (path.isAbsolute(relativePath)) {
    return relativePath
  } else {
    return path.resolve(path.join(__dirname, '..', '..', relativePath))
  }
}

export function ensureTrailingSlash (path: string) {
  return path.endsWith('/')
    ? path
    : path + '/'
}
