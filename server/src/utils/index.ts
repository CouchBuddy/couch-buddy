export function removeFileExtension (fileName: string): string {
  return fileName.replace(/\.[^/.]+$/, '')
}

export function getTmdbImageUrl (path: string) {
  return `http://image.tmdb.org/t/p/w500${path}`
}
