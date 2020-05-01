const ffmpeg = require('fluent-ffmpeg')
const glob = require('glob')
const mime = require('mime-types')
const path = require('path')
const ptt = require('parse-torrent-title')

const config = require('../config')
const { Episode, MediaFile, Movie } = require('../models')
const movieInfoProvider = require('../services/tmdb')

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

  // Movie or Episode ID
  let mediaId

  const item = searchShowInfo(fileBaseName)
  const isEpisode = item.type === 'episode'

  if (isEpisode) {
    // Search if the parent series of this episode is already in the DB
    const where = { type: 'series' }

    if (item.movie.imdb_id) {
      where.imdbId = item.movie.imdb_id
    } else {
      where.title = item.movie.title
    }

    let series = await Movie.findOne({ where })

    // If not, this is the first episode of the series encountered
    // and we need to find the series info
    if (!series) {
      series = await Movie.create(item.movie)
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
      part: item.part
    })
  } else {
    await MediaFile.update({
      mediaId,
      mediaType: isEpisode ? 'episode' : 'movie',
      part: item.part
    }, {
      where: { id: existingFile.id }
    })
  }

  return true
}

async function searchShowInfo (fileBaseName) {
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

  const isEpisode = basicInfo.season && basicInfo.episode

  // Search video info, it could be a movie or a TV series episode
  let item

  if (isEpisode) {
    item = await movieInfoProvider.searchEpisode(basicInfo.title, basicInfo.season, basicInfo.episode)
  } else {
    item = await movieInfoProvider.searchMovie(basicInfo.title, basicInfo.year)
  }

  // If we can't find anything, at least we have basicInfo
  if (!item) {
    item = basicInfo
  }

  // Ensure some properties are on the returned object
  item.type = isEpisode ? 'episode' : 'movie'
  item.part = basicInfo.part

  return item
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
  parseTorrentTitle: ptt.parse,
  searchShowInfo,
  searchVideoFiles,
  takeScreenshot
}
