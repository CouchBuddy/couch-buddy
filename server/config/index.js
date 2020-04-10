const { constantCase } = require('change-case')
// load env vars from .env file
require('dotenv').config()

const config = {
  dbSqlitePath: process.env.DB_SQLITE_PATH,
  /**
   * Directory where media files are stored, the path is absolute
   */
  mediaDir: process.env.MEDIA_DIR,
  omdbApiKey: process.env.OMDB_API_KEY,
  openSubtitlesUa: process.env.OPEN_SUBTITLES_UA,
  /**
   * Server port
   */
  port: parseInt(process.env.PORT) || 3000
}

// Check configuration correctness
const missingConfigs = []
for (const key in config) {
  if (!config[key]) {
    missingConfigs.push(constantCase(key))
  }
}

if (missingConfigs.length) {
  console.warn('The following configurations are missing, please set them in the .env file or in your enrivonment:')
  console.warn(missingConfigs.join(', '))
}

module.exports = config
