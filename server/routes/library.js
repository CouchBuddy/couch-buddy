const axios = require('axios')
const fs = require('fs')
const glob = require('glob')
const ptt = require('parse-torrent-title')
const path = require('path')

const OMDB_KEY = process.env.OMDB_KEY

async function scanLibrary (ctx) {
  const videos = await searchVideos()

  const library = []
  let id = 1
  const episodes = []
  let episodeId = 1

  for (const filename of videos) {
    const info = ptt.parse(path.basename(filename))

    try {
      const response = await axios.get('http://www.omdbapi.com/', {
        params: {
          t: info.title,
          apikey: OMDB_KEY
        }
      })

      const item = Object.assign(info, { id })

      if (!response.data.Error) {
        for (const k in response.data) {
          item[k.toLowerCase()] = response.data[k]
        }

        if (!!item.season || !!item.episode || item.type === 'series') {
          // It's a series, so add the episode with the filename and link it to the library

          const existingItem = library.find(i => i.imdbid === item.imdbid || i.title === item.title)

          item.type = 'series'
          episodes.push({
            id: episodeId,
            libraryId: existingItem ? existingItem.id : id,
            season: item.season,
            episode: item.episode,
            filename
          })

          episodeId++

          if (existingItem) { continue }
        } else {
          item.filename = filename
        }
      } else {
        // Not found on OMDb
        console.warn(response.data.Error, info.title)
      }

      library.push(item)
    } catch (e) {
      console.log('Failed request for', info.title)
      console.error(e.message)
    }

    id++
  }

  fs.writeFileSync('data/library.json', JSON.stringify(library))
  fs.writeFileSync('data/episodes.json', JSON.stringify(episodes))

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

function searchVideos () {
  return new Promise((resolve, reject) => {
    const options = {
      cwd: process.env.MEDIA_BASE_DIR,
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
