const ffmpeg = require('fluent-ffmpeg')
const glob = require('glob')
const mime = require('mime-types')
const path = require('path')
const ptt = require('parse-torrent-title')

const config = require('../config')
const { Episode, MediaFile, Movie } = require('../models')
const omdb = require('../services/omdb')

// Add custom handler to PTT for parts and CD
ptt.addHandler('part', /(?:Part|CD)[. ]?([0-9])/i, { type: 'integer' })

async function addFileToLibrary (_fileName, force = false) {
  if (!_fileName) {
    console.error('fileName is null')
    return
  }

  const fileName = path.isAbsolute(_fileName)
    ? path.relative(config.mediaDir, _fileName)
    : _fileName

  const mimeType = mime.lookup(fileName)
  if (!mimeType.startsWith('video/')) {
    console.log('Ignoring non-video file', fileName)
    return
  }

  const existingFile = await MediaFile.findOne({ where: { fileName } })

  // If the file has already been indexed, skip it or not based on `force`
  if (existingFile) {
    if (force) {
      console.log('Updating existing file:', fileName)
    } else {
      return
    }
  }

  // Parse filename to obtain basic info
  const fileBaseName = path.basename(fileName)
  const basicInfo = ptt.parse(fileBaseName)

  // Worst case scenario: ptt can't even find a title, so try to clean the filename
  if (!basicInfo.title) {
    basicInfo.title = fileBaseName
      // remove extension
      .replace(/\.[^/.]+$/, '')
      // replace . and _ with whitespace
      .replace(/[._]/, ' ')
      // remove parenthesis and their content
      .replace(/(\(.*\)|\[.*\])/, '')
      // remove everything after a dash
      .replace(/-.*$/, '')
      .trim()

    // worst-worst case: filename cleaned too much, just remove the extension
    basicInfo.title = basicInfo.title || fileBaseName.replace(/\.[^/.]+$/, '')

    console.log('PTT failed, obtained title from filename', basicInfo.title)
  }

  // Search movie info on OMDb
  let item = await omdb(basicInfo)

  // If we can't find anything on OMDb, at least we have basicInfo
  if (!item) {
    item = basicInfo
  }

  const isEpisode = !!item.season || !!item.episode || item.type === 'series' || item.type === 'episode'
  item.type = isEpisode ? 'series' : 'movie'

  let mediaId

  if (isEpisode) {
    // Search if the parent series of this episode is already in the DB,
    // if not, this is the first episode of the series encountered
    // and we need to find the series info
    const where = { type: 'series' }

    if (item.seriesID) {
      where.imdbId = item.seriesID
    } else {
      where.title = item.title
    }

    let series = await Movie.findOne({ where })

    if (!series) {
      item = await omdb(where)
      series = await Movie.create(item)
    }

    const thumbnail = await takeScreenshot(config.mediaDir + fileName)

    if (!existingFile) {
      const episode = await Episode.create({
        movieId: series.id,
        thumbnail,
        ...item
      })
      mediaId = episode.id
    } else {
      await Episode.update(item, { where: { id: existingFile.mediaId } })
      mediaId = existingFile.mediaId
    }
  } else {
    // It's a movie, create it if it doesn't exist already, this handles multiple
    // movie versions and parts (CD1, 2, ...)
    if (!existingFile) {
      const where = {}
      if (item.imdbId) {
        where.imdbId = item.imdbId
      } else {
        where.title = item.title
      }

      const [ movie ] = await Movie.findOrCreate({ where, defaults: item })
      mediaId = movie.id
    } else {
      await Movie.update(item, { where: { id: existingFile.mediaId } })
      mediaId = existingFile.mediaId
    }
  }

  if (!existingFile) {
    await MediaFile.create({
      fileName,
      mediaId,
      mediaType: isEpisode ? 'episode' : 'movie',
      mimeType,
      part: basicInfo.part
    })
  } else {
    await MediaFile.update({
      mediaId,
      mediaType: isEpisode ? 'episode' : 'movie',
      part: basicInfo.part
    }, {
      where: { id: existingFile.id }
    })
  }

  return true
}

function searchVideoFiles (dir) {
  return new Promise((resolve, reject) => {
    const options = {
      cwd: dir,
      matchBase: true,
      nocase: true,
      nodir: true
    }

    glob('**/*.{mp4,mkv,avi}', options, (err, files) => {
      if (err) {
        reject(err)
      }

      resolve(files)
    })
  })
}

function takeScreenshot (file) {
  const folder = path.dirname(file)
  const folderRelative = path.relative(config.mediaDir, folder)

  return new Promise((resolve) => {
    ffmpeg(file)
      .on('filenames', (filenames) => {
        resolve(path.join(folderRelative, filenames[0]))
      })
      .screenshots({ count: 1, filename: '%b.png', folder })
  })
}

module.exports = {
  addFileToLibrary,
  searchVideoFiles,
  takeScreenshot
}
