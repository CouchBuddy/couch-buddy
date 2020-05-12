const OS = require('opensubtitles-api')

require('./boot')
const config = require('../config')

const OpenSubtitles = new OS(config.openSubtitlesUa)

OpenSubtitles.api.GetSubLanguages()
  .then(console.log)
