import dotenv from 'dotenv'
import fs from 'fs'

import AppConfig from './AppConfig'
import { ensureTrailingSlash } from '../utils'

const nodeEnv = process.env.NODE_ENV || 'development'
console.log(`NODE_ENV=${nodeEnv}`)

// Load default env vars from .env file
dotenv.config({ path: '.env' })

// Load environment-specific config from .env.<environment> file, if it exists.
// Env-specific configs have precedence over default ones.
const envConfigFile = `.env.${nodeEnv}`

if (fs.existsSync(envConfigFile)) {
  const envConfig = dotenv.parse(fs.readFileSync(envConfigFile))
  Object.assign(process.env, envConfig)
}

const config = new class Config extends AppConfig {
  nodeEnv = nodeEnv

  dbSqlitePath = process.env.DB_SQLITE_PATH || 'db.sqlite'

  mediaDir = ensureTrailingSlash(process.env.MEDIA_DIR)

  omdbApiKey = process.env.OMDB_API_KEY

  openSubtitlesUa = process.env.OPEN_SUBTITLES_UA

  tmdbApiKey = process.env.TMDB_API_KEY

  port = parseInt(process.env.PORT) || 3000

  wsPort = parseInt(process.env.WS_PORT) || 3001
}()

export default config
