const ffmpeg = require('fluent-ffmpeg')
const fs = require('fs')
const glob = require('glob')
const mime = require('mime-types')
const path = require('path')
const ptt = require('parse-torrent-title')
const srt2vtt = require('srt-to-vtt')

const config = require('../config')
const { Episode, MediaFile, Movie, SubtitlesFile, sequelize } = require('../models')
const movieInfoProvider = require('../services/tmdb')
const { removeFileExtension } = require('../utils')

// Define files extensions by content type
const EXTENSIONS_SUBTITLES = [ 'srt', 'vtt' ]
const EXTENSIONS_VIDEOS = [ 'mp4', 'mkv', 'avi' ]

// Add custom handler to PTT for parts and CD
ptt.addHandler('part', /(?:Part|CD)[. ]?([0-9])/i, { type: 'integer' })
ptt.addHandler('language', /\.([a-z]{2})\.[a-z]{3,4}$/i)

async function scanDirectory (dir) {
  const directories = await getDirectoryContent(dir)

  let allSubs = 0
  let coupledSubs = 0

  for (const dir in directories) {
    const videos = directories[dir].videos.map(fileName => ({ fileName, info: parseFileName(fileName) }))
    let subtitles = directories[dir].subtitles.map(fileName => ({ fileName, info: parseFileName(fileName) }))

    allSubs += subtitles.length

    for (const video of videos) {
      // A subtitle matches a video if the first part of the name is the same, i.e.:
      //   video.mp4 and video.en.srt
      // or if the info obtained by parsing the filename is the same
      let matchingSubtitles = subtitles.filter(subs => {
        return subs.fileName.startsWith(removeFileExtension(video.fileName)) ||
        (
          subs.info.title === video.info.title &&
          subs.info.season === video.info.season &&
          subs.info.episode === video.info.episode
        )
      })

      // If a subtitles file match a video, then is not available for other videos
      subtitles = subtitles.filter(subs => !matchingSubtitles.includes(subs))

      // As a last resort, if the subs don't match, but there is only 1 video in a directory,
      // let's assume that those subs refer to the video file
      if (!matchingSubtitles.length && videos.length === 1 && subtitles.length) {
        matchingSubtitles = [ ...subtitles ]
        subtitles = []
      }

      const result = await addFileToLibrary(path.join(dir, video.fileName))
      if (!result) { continue }

      for (const subsFile of matchingSubtitles) {
        const [ id, type ] = result

        const lang = (subsFile.language || 'en').toLowerCase()
        const subsFileType = mime.lookup(subsFile.fileName)

        // Make subs filename an absolute path
        subsFile.fileName = path.join(dir, subsFile.fileName)

        if (subsFileType === 'application/x-subrip') {
          const vttFileName = removeFileExtension(subsFile.fileName) + '.vtt'

          // The .srt is going to be converted into .vtt, but the output
          // filename already exists, most likely the .srt has been already
          // converted to .vtt, so just skip this file
          if (matchingSubtitles.includes(vttFileName)) { continue }

          fs.createReadStream(subsFile.fileName)
            .pipe(srt2vtt())
            .pipe(fs.createWriteStream(vttFileName))

          // The .vtt file path is the one to be saved on the DB
          subsFile.fileName = vttFileName
        } else if (subsFileType !== 'text/vtt') {
          console.warn('Unsupported subtitles file type', subsFile.fileName)
          continue
        }

        const subs = new SubtitlesFile({
          fileName: path.relative(config.mediaDir, subsFile.fileName),
          mediaId: id,
          mediaType: type,
          lang
        })

        await subs.save()
      }

      coupledSubs += matchingSubtitles.length
    }

    if (subtitles.length) {
      console.log('unmatched subs', subtitles)
    }
  }

  console.log('matched', coupledSubs, allSubs)
}

/**
 * Add a single video file to the library, the video can be a movie or an episode.
 *
 * @param {String} _fileName Path to a video file. The path can be absolute or relative,
 *   but in any case it must be included into `config.mediaDir`, if the path is absolute, the
 *   relative path is calculated and stored in the DB.
 * @param {Boolean} force If true, update the video info even if the file has been already added to
 *   the library.
 *
 * @return {Promise<[Number, String]>} Returns an array where the first element is the ID of the record created
 *   or updated in the DB, the second is the model name and can be 'movie' or 'episode'. If the video file
 *   is invalid or it already exists in the library (and `force` is false) no DB operations are done and
 *   the return value is null.
 */
async function addFileToLibrary (_fileName, force = false) {
  if (!_fileName) {
    console.error('fileName is null')
    return null
  }

  const fileName = path.isAbsolute(_fileName)
    ? path.relative(config.mediaDir, _fileName)
    : _fileName

  const mimeType = mime.lookup(fileName)
  if (!mimeType.startsWith('video/')) {
    console.log('Ignoring non-video file', fileName)
    return null
  }

  const existingFile = await MediaFile.findOne({ where: { fileName } })

  // If the file has already been indexed, skip it or not based on `force`
  if (existingFile) {
    if (force) {
      console.log('Updating existing file:', fileName)
    } else {
      return null
    }
  }

  const transaction = await sequelize.transaction()

  try {
    // Movie or Episode ID
    let mediaId

    const item = await searchShowInfo(fileName)
    console.log('Found movie info', fileName, item)
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
        series = await Movie.create(item.movie, { transaction })
      }

      const thumbnail = await takeScreenshot(config.mediaDir + fileName)

      if (!existingFile) {
        const episode = await Episode.create({
          movieId: series.id,
          thumbnail,
          ...item
        }, { transaction })
        mediaId = episode.id
      } else {
        await Episode.update(item, { where: { id: existingFile.mediaId }, transaction })
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

        const [ movie ] = await Movie.findOrCreate({ where, defaults: item, transaction })
        mediaId = movie.id
      } else {
        await Movie.update(item, { where: { id: existingFile.mediaId }, transaction })
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
      }, { transaction })
    } else {
      await MediaFile.update({
        mediaId,
        mediaType: isEpisode ? 'episode' : 'movie',
        part: item.part
      }, {
        where: { id: existingFile.id },
        transaction
      })
    }

    await transaction.commit()
    return [ mediaId, isEpisode ? 'episode' : 'movie' ]
  } catch (e) {
    await transaction.rollback()

    console.error(e)
    return null
  }
}

function parseFileName (fileName) {
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
  }

  return basicInfo
}

async function searchShowInfo (fileName) {
  const basicInfo = parseFileName(fileName)

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

/**
 * Read a directory and its subdirectories and returns a
 * flat map of directories and files, i.e.:
 * ```
 * {
 *  'dir1': { subtitles: [ 'file1.srt', 'file2.vtt' ], videos: [ 'movie.mp4' ] },
 *  'dir1/subdir': { subtitles: [ 'otherfile' ], videos: [ 'some.avi' ] }
 * }
 * ```
 *
 * @param {String} dir the directory to read
 * @param {String[]} [extensions] an array of file extensions to fiter the directory content,
 *   i.e.: `[ 'mp4', 'srt' ]`
 *
 * @return {Map<String, Map<String, String[]>>}
 */
async function getDirectoryContent (dir, extensions) {
  const directories = {}

  const walkDir = async function (dir, extensions) {
    const subtitles = []
    const videos = []

    for (const file of await fs.promises.readdir(dir)) {
      const fullPath = path.join(dir, file)

      const ext = file[0] !== '.' ? file.split('.').pop() : null

      if (Array.isArray(extensions) && extensions.length) {
        if (!ext || !extensions.includes(ext)) { continue }
      }

      if ((await fs.promises.lstat(fullPath)).isDirectory()) {
        await walkDir(fullPath, extensions)
      } else {
        if (EXTENSIONS_SUBTITLES.includes(ext)) {
          subtitles.push(file)
        } else if (EXTENSIONS_VIDEOS.includes(ext)) {
          videos.push(file)
        }
      }
    }

    directories[dir] = { subtitles, videos }
  }

  await walkDir(dir, extensions)

  return directories
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
  getDirectoryContent,
  parseFileName,
  scanDirectory,
  searchShowInfo,
  searchVideoFiles,
  takeScreenshot
}
