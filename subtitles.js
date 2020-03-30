const OS = require('opensubtitles-api')
const OpenSubtitles = new OS(process.env.OPENSUBTITLES_UA)

/**
 * Call it:
 *  downloadSubtitles({
 *    path: '/home/luca/Downloads/Bohemian Rhapsody (2018) [BluRay] [1080p] [YTS.AM]/Bohemian.Rhapsody.2018.1080p.BluRay.x264-[YTS.AM].mp4',
 *    imdbid: 'tt1727824'
 *  }, 'en')
 * @param {*} movie
 * @param {*} lang
 */
async function downloadSubtitles (movie, lang) {
  const result = await OpenSubtitles.search({
    sublanguageid: lang,
    path: movie.path,
    imdbid: movie.imdbid
  })

  return result[lang]
}

module.exports = {
  downloadSubtitles
}
