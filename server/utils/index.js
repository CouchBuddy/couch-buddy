module.exports = {
  removeFileExtension (fileName) {
    return fileName.replace(/\.[^/.]+$/, '')
  }
}
