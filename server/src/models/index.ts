import { createConnection } from 'typeorm'

import config from '../config'
import Download from './Download'
import Episode from './Episode'
import Extention from './Extension'
import MediaFile from './MediaFile'
import Movie from './Movie'
import Subtitles from './SubtitlesFile'
import migrations from '../migrations'

export async function init () {
  await createConnection({
    type: 'sqlite',
    database: config.dbSqlitePath,
    entities: [
      Download,
      Episode,
      Extention,
      MediaFile,
      Movie,
      Subtitles
    ],
    logging: false,
    migrations,
    migrationsRun: !config.isDevelopment
  })
}
