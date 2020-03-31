const axios = require('axios')
const glob = require('glob')
const mime = require('mime-types')
const ptt = require('parse-torrent-title')
const path = require('path')

const { Episode, MediaFile, Movie } = require('../models')

const OMDB_KEY = process.env.OMDB_KEY

async function scanLibrary (ctx = {}) {
  // Scan directory to search video files
  const videos = await searchVideoFiles(process.env.MEDIA_BASE_DIR)
  console.log(`Found ${videos.length} video files in ${process.env.MEDIA_BASE_DIR}`)

  for (const fileName of videos) {
    // Parse filename to obtain basic info
    const basicInfo = ptt.parse(path.basename(fileName))

    // If the file has already been indexed, skip it
    const existingFile = await MediaFile.findOne({ where: { fileName } })
    if (existingFile) {
      continue
    }

    const item = { ...basicInfo }

    // Search movie info on OMDb through title
    try {
      const response = await axios.get('http://www.omdbapi.com/', {
        params: {
          t: basicInfo.title,
          apikey: OMDB_KEY
        }
      })

      if (!response.data.Error) {
        // Found info on OMDb, refactor object to match Movie/Episode model
        for (const k in response.data) {
          item[k.toLowerCase()] = response.data[k]
        }

        item.imdbId = item.imdbid
        item.ratingImdb = parseFloat(item.imdbrating)
        item.ratingMetacritic = parseInt(item.metascore)

        const rt = item.ratings.find(x => x.Source === 'Rotten Tomatoes')
        if (rt) {
          item.ratingRottenTomatoes = parseInt(rt.Value)
        }
      } else {
        // Not found on OMDb
        console.warn(response.data.Error, basicInfo.title)
      }
    } catch (e) {
      console.log('OMDb request failed for:', basicInfo.title)
      console.error(e.message)
    }

    const where = {}
    if (item.imdbid) {
      where.imdbid = item.imdbid
    } else {
      where.title = item.title
    }

    const [ movie ] = await Movie.findOrCreate({ where, defaults: item })
    let episode

    const isSeries = !!item.season || !!item.episode || item.type === 'series'

    if (isSeries) {
      item.type = 'series'

      episode = await Episode.create({
        movieId: movie.id,
        ...item
      })
    }

    await MediaFile.create({
      fileName,
      mediaId: isSeries ? episode.id : movie.id,
      mediaType: isSeries ? 'episode' : 'movie',
      mimeType: mime.lookup(fileName)
    })
  }

  ctx.status = 204
}

function listLibrary (ctx) {
  const library = require('../data/library.json')

  ctx.body = library
}

function getLibrary (ctx) {
  const library = require('../data/library.json')

  const movieId = parseInt(ctx.params.id)
  const movie = library.find(item => item.id === movieId)

  ctx.assert(movie, 404)

  ctx.body = movie
}

function listEpisodes (ctx) {
  const episodes = require('../data/episodes.json')

  const seriesId = parseInt(ctx.params.id)
  ctx.assert(seriesId, 404, 'Please provide an ID in the URL')

  ctx.body = episodes.filter(e => e.libraryId === seriesId)
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

module.exports = {
  getLibrary,
  listLibrary,
  scanLibrary,

  listEpisodes
}
