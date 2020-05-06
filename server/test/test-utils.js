const expect = require('chai').expect

const { removeFileExtension } = require('../utils')

describe('Utils lib', function () {
  it('shouldn\'t remove extension to hidden files without extension', function () {
    expect(removeFileExtension('.gitignore')).to.be.equal('.gitignore')
  })

  it('should remove extension to hidden files with extension', function () {
    expect(removeFileExtension('.config.json')).to.be.equal('.config')
  })

  it('should remove extension', function () {
    expect(removeFileExtension('video.mp4')).to.be.equal('video')
  })

  it('should ignore dots in the middle', function () {
    expect(removeFileExtension('video.en.mp4')).to.be.equal('video.en')
  })

  it('should ignore directories', function () {
    expect(removeFileExtension('videos/')).to.be.equal('videos/')
  })

  it('should ignore directories with dots', function () {
    expect(removeFileExtension('my.videos/')).to.be.equal('my.videos/')
  })
})
