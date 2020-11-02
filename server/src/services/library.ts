import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs'
import glob from 'glob'
import mime from 'mime-types'
import path from 'path'
import { Parser, DefaultParserResult, addDefaults } from 'parse-torrent-title'
import srt2vtt from 'srt-to-vtt'
import { FindConditions, getConnection } from 'typeorm'

import config from '../config'
import Episode from '../models/Episode'
import MediaFile from '../models/MediaFile'
import Movie from '../models/Movie'
import SubtitlesFile from '../models/SubtitlesFile'
import * as movieInfoProvider from './tmdb'
import { isValidURL, removeFileExtension } from '../utils'

interface ParserResult extends DefaultParserResult {
  part?: number;
}

interface DirectoryContent {
  subtitles: string[];
  videos: string[];
}

// Define files extensions by content type
const EXTENSIONS_SUBTITLES = [ 'srt', 'vtt' ]
const EXTENSIONS_VIDEOS = [ 'mp4', 'mkv', 'avi' ]

const ptt = new Parser<ParserResult>()
addDefaults(ptt)

// Add custom handler to PTT for parts and CD
ptt.addHandler('part', /(?:Part|CD)[. ]?([0-9])/i, { type: 'integer' })
ptt.addHandler('language', /\.([a-z]{2})\.[a-z]{3,4}$/i)

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
 * @param dir the directory to read, it must be an absolute path
 * @param extensions an array of file extensions to fiter the directory content,
 *   i.e.: `[ 'mp4', 'srt' ]`
 */
export async function getDirectoryContent (dir: string, extensions?: string[]) {
  const directories: { [dir: string]: DirectoryContent } = {}

  const walkDir = async function (dir: string, extensions?: string[]) {
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

export function takeScreenshot (file: string): Promise<string> {
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

export function parseFileName (fileName: string): ParserResult {
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

export async function searchShowInfo (fileName: string): Promise<Movie | Episode | undefined> {
  const basicInfo = parseFileName(fileName)

  const isEpisode = basicInfo.season && basicInfo.episode

  // Search video info, it could be a movie or a TV series episode
  let item: Movie | Episode

  if (isEpisode) {
    item = await movieInfoProvider.searchEpisode(basicInfo.title, basicInfo.season, basicInfo.episode)
  } else {
    item = await movieInfoProvider.searchMovie(basicInfo.title, basicInfo.year)
  }

  // If we can't find anything, at least we have basicInfo
  if (!item) {
    // if (isEpisode) {
    //   item = new Episode()
    //   item.season = basicInfo.season
    //   item.episode = basicInfo.episode
    // } else {
    //   item = new Movie()
    // }

    // item.title = basicInfo.title
    // item.year = basicInfo.year
    return undefined
  }

  item.part = basicInfo.part

  return item
}

/**
 * Add a single video file to the library, the video can be a movie or an episode.
 *
 * @param _fileName Path to a video file. The path can be absolute or relative,
 *   but in any case it must be included into `config.mediaDir`, if the path is absolute, the
 *   relative path is calculated and stored in the DB.
 * @param movieTitle If not present, the filename will be used for searching movie info
 * @param _mimeType If not present, the mimetype will be derived from the filename
 * @param force If true, update the video info even if the file has been already added to
 *   the library.
 *
 * @return Returns an array where the first element is the ID of the record created
 *   or updated in the DB, the second is the model name and can be 'movie' or 'episode'. If the video file
 *   is invalid or it already exists in the library (and `force` is false) no DB operations are done and
 *   the return value is null.
 */
export async function addFileToLibrary (_fileName: string, movieTitle?: string, _mimeType?: string, force = false): Promise<[number, string]> {
  if (!_fileName) {
    console.error('fileName is null')
    return null
  }

  const fileNameIsURL = isValidURL(_fileName)

  const fileName = !fileNameIsURL && path.isAbsolute(_fileName)
    ? path.relative(config.mediaDir, _fileName)
    : _fileName

  const mimeType = _mimeType || mime.lookup(fileName)
  if (!mimeType || !mimeType.startsWith('video/')) {
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

  const item = await searchShowInfo(movieTitle || fileName)
  if (!item) {
    return null
  }

  return await getConnection().transaction(async transaction => {
    // Movie or Episode ID
    let mediaId: number

    // Add the ID if the show exists, this is important for DB .save() functions
    // as they create or update a row based on the presence of ID
    if (existingFile) {
      item.id = existingFile.mediaId
    }

    const isEpisode = item.constructor.name === 'Episode'

    if (isEpisode) {
      const episode = item as Episode

      // Search if the parent series of this episode is already in the DB
      const where: FindConditions<Movie> = { type: 'series' }

      if (episode.movie.imdbId) {
        where.imdbId = episode.movie.imdbId
      } else {
        where.title = episode.movie.title
      }

      let series: Movie = await Movie.findOne({ where })

      // If not, this is the first episode encountered
      // and we need to create the series
      if (!series) {
        series = await transaction.save(episode.movie)
      }

      episode.movie = series

      if (!fileNameIsURL) {
        episode.thumbnail = await takeScreenshot(config.mediaDir + fileName)
      }

      const savedEpisode = await transaction.save(episode)
      mediaId = savedEpisode.id
    } else {
      const movie = item as Movie

      // The file doesn't exist, but it may be the part of a movie, so the Movie
      // entity may already exist
      if (!existingFile) {
        const where: FindConditions<Movie> = {}

        if (item.imdbId) {
          where.imdbId = item.imdbId
        } else {
          where.title = item.title
        }

        const existingMovie = await Movie.findOne({ where })
        if (existingMovie) {
          movie.id = existingMovie.id
        }
      }

      const savedMovie = await transaction.save(movie)
      mediaId = savedMovie.id
    }

    if (!existingFile) {
      await transaction.save(MediaFile.create({
        fileName,
        mediaId,
        mediaType: isEpisode ? 'episode' : 'movie',
        mimeType,
        part: item.part
      }))
    } else {
      await transaction.save(existingFile)
    }

    return [ mediaId, isEpisode ? 'episode' : 'movie' ]
  })
}

/**
 * Search video and subtitles files in a directory and in its children
 * and add them to the library. Internally it calls `addFileToLibrary()`,
 * but it also takes into account the directory where files are stored,
 * so it can match videos and subtitles, whereas `addFileToLibrary()`
 * just add video files to the library.
 *
 * @param dir absolute path to a directory
 */
export async function scanDirectory (dir: string) {
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

        const lang = (subsFile.info.language || 'en').toLowerCase()
        const subsFileType = mime.lookup(subsFile.fileName)

        // Make subs filename an absolute path
        subsFile.fileName = path.join(dir, subsFile.fileName)

        if (subsFileType === 'application/x-subrip') {
          const vttFileName = removeFileExtension(subsFile.fileName) + '.vtt'

          // The .srt is going to be converted into .vtt, but the output
          // filename already exists, most likely the .srt has been already
          // converted to .vtt, so just skip this file
          if (matchingSubtitles.find(subs => subs.fileName === vttFileName)) { continue }

          fs.createReadStream(subsFile.fileName)
            .pipe(srt2vtt())
            .pipe(fs.createWriteStream(vttFileName))

          // The .vtt file path is the one to be saved on the DB
          subsFile.fileName = vttFileName
        } else if (subsFileType !== 'text/vtt') {
          console.warn('Unsupported subtitles file type', subsFile.fileName)
          continue
        }

        const subs = new SubtitlesFile()
        subs.fileName = path.relative(config.mediaDir, subsFile.fileName)
        subs.mediaId = id
        subs.mediaType = type
        subs.lang = lang

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

export function searchVideoFiles (dir: string): Promise<string[]> {
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
