require('./boot')
const OS = require('opensubtitles-api')

const OpenSubtitles = new OS(process.env.OPENSUBTITLES_UA)

OpenSubtitles.api.GetSubLanguages()
  .then(console.log)
