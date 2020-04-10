const ptt = require('parse-torrent-title')
const path = require('path')

const omdb = require('../services/omdb')

ptt.addHandler('part', /(?:Part|CD)[. ]?([0-9])/i, { type: 'integer' })

async function main () {
  // const PATH = 'Romanzo Criminale 2 -seconda serie completa/Romanzo.Criminale.S02E03.iTALiAN.HDTV.XviD-SiD.avi'
  // const PATH = 'Star.Wars.Episode.4.A.New.Hope.1977.1080p.BrRip.x264.BOKUTOX.YIFY.mp4'
  // const PATH = 'Star Wars Episode V The Empire Strikes Back (1980) [1080p]/Star.Wars.Episode.5.The.Empire.Strikes.Back.1980.1080p.BrRip.x264.BOKUTOX.YIFY.mp4'
  // const PATH = 'Star Wars Episode VI Return of the Jedi (1983) [1080p]/Star.Wars.Episode.6.Return.of.the.Jedi.1983.1080p.BrRip.x264.BOKUTOX.YIFY.mp4'
  // const PATH = 'La Dolce Vita/(1960) La Dolce Vita - CD1.avi'
  // const PATH = 'Non è un paese per vecchi/Non è un paese per vecchi - CD 2.avi'
  const PATH = 'The.Handmaids.Tale.S01E03.720p.WEBRip.x264-MOROSE[eztv].mkv'

  const fileName = path.basename(PATH)
  console.log('File name:', fileName)

  const basicInfo = ptt.parse(fileName)

  if (!basicInfo.title) {
    basicInfo.title = fileName
      // remove extension
      .replace(/\.[^/.]+$/, '')
      // replace . and _ with whitespace
      .replace(/[._]/, ' ')
      // remove parenthesis and their content
      .replace(/(\(.*\)|\[.*\])/, '')
      // remove everything after a dash
      .replace(/-.*$/, '')
      .trim()
  }
  console.log('basic:', basicInfo)

  const result = await omdb(basicInfo)
  console.log('OMDb:', result)
}

if (require.main === module) {
  (async function () {
    await main(await require('../scripts/boot'))
    process.exit(0)
  })()
}
