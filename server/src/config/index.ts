import AppConfig from './AppConfig'
import dotenv from 'dotenv'
import fs from 'fs'

// Load default env vars from .env file
dotenv.config()

// Load environment-specific config from .env.<environment> file
const envConfigFile = `.env.${process.env.NODE_ENV}`

if (fs.existsSync(envConfigFile)) {
  const envConfig = dotenv.parse(fs.readFileSync(envConfigFile))
  Object.assign(process.env, envConfig)
}

const config = new class Config extends AppConfig {
  nodeEnv = process.env.NODE_ENV || 'development'

  dbSqlitePath = process.env.DB_SQLITE_PATH

  mediaDir = process.env.MEDIA_DIR

  omdbApiKey = process.env.OMDB_API_KEY

  openSubtitlesUa = process.env.OPEN_SUBTITLES_UA

  tmdbApiKey = process.env.TMDB_API_KEY

  port = parseInt(process.env.PORT) || 3000

  wsPort = parseInt(process.env.WS_PORT) || 3001
}()

export default config
