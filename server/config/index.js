const { constantCase } = require('change-case')
// load env vars from .env file
require('dotenv').config()

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  dbSqlitePath: process.env.DB_SQLITE_PATH,

  /**
   * Directory where media files are stored, the path is absolute
   */
  mediaDir: process.env.MEDIA_DIR,
  omdbApiKey: process.env.OMDB_API_KEY,
  openSubtitlesUa: process.env.OPEN_SUBTITLES_UA,
  tmdbApiKey: process.env.TMDB_API_KEY,

  /**
   * Server port
   */
  port: parseInt(process.env.PORT) || 3000,

  /**
   * WebSocket port
   */
  wsPort: parseInt(process.env.WS_PORT) || 3001
}

const MANDATORY_CONFIGS = [
  'dbSqlitePath',
  'mediaDir',
  'port',
  'wsPort'
]

// Check configuration correctness
const missingConfigs = []
const missingConfigsMandatory = []

for (const key in config) {
  if (typeof config[key] === 'undefined') {
    if (MANDATORY_CONFIGS.includes(key)) {
      missingConfigsMandatory.push(constantCase(key))
    } else {
      missingConfigs.push(constantCase(key))
    }
  }
}

if (missingConfigs.length) {
  console.warn('The following configurations are missing, they\'re optional but they may limit Couch Buddy features:')
  console.warn(missingConfigs.join(', '))
}

if (missingConfigsMandatory.length) {
  console.error('The following configurations are mandatory, Couch Buddy cannot work without them:')
  console.error(missingConfigsMandatory.join(', '))
  process.exit(1)
}

module.exports = config
