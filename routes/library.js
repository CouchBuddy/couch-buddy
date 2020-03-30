const axios = require('axios')
const fs = require('fs')
const glob = require('glob')
const ptt = require('parse-torrent-title')
const path = require('path')

const OMDB_KEY = process.env.OMDB_KEY;

(async function () {
  const videos = await searchVideos()

  const library = []
  let id = 1
  for (const filename of videos) {
    const info = ptt.parse(path.basename(filename))

    try {
      const response = await axios.get('http://www.omdbapi.com/', {
        params: {
          t: info.title,
          apikey: OMDB_KEY
        }
      })

      const item = Object.assign(info, {
        id,
        filename
      })

      if (!response.data.Error) {
        for (const k in response.data) {
          item[k.toLowerCase()] = response.data[k]
        }

        console.log('Found', response.data.Title)
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
})()

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
