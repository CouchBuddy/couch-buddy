import AppConfig from './AppConfig'
import dotenv from 'dotenv'

// load env vars from .env file
dotenv.config()

const config: AppConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',

  get isProduction() { return this.nodeEnv === 'production' },

  dbSqlitePath: process.env.DB_SQLITE_PATH,

  mediaDir: process.env.MEDIA_DIR,

  omdbApiKey: process.env.OMDB_API_KEY,

  openSubtitlesUa: process.env.OPEN_SUBTITLES_UA,

  tmdbApiKey: process.env.TMDB_API_KEY,

  port: parseInt(process.env.PORT) || 3000,

  wsPort: parseInt(process.env.WS_PORT) || 3001
}

export default config
