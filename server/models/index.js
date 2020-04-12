const glob = require('glob')
const path = require('path')
const Sequelize = require('sequelize')

const config = require('../config')

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: config.dbSqlitePath,
  logging: false
})

const models = {}

async function sync () {
  try {
    await sequelize.sync()
    console.log('DB tables created correctly')

    /**
     * Set up Full Text Search using SQLite FTS5 extension
     */

    // Check if FTS tables have been already created, all the next queries are safe, but the 'INSERT INTO' queries
    const [ ftsTableExists ] = await sequelize.query('SELECT name FROM sqlite_master WHERE type=\'table\' AND name=\'movies_fts\';', { type: Sequelize.QueryTypes.SELECT })
    if (ftsTableExists) {
      return
    }

    // Create a virtual table for FTS5 based on `movies` columns
    const searchFields = 'id, actors, director, plot, title'
    await sequelize.query(`CREATE VIRTUAL TABLE IF NOT EXISTS movies_fts USING fts5(${searchFields});`)

    // Copy rows from the normal movies table to FTS movie table
    await sequelize.query(`INSERT INTO movies_fts SELECT ${searchFields} FROM movies;`)

    // Set default columns weights for search order
    await sequelize.query('INSERT INTO movies_fts(movies_fts, rank) VALUES(\'rank\', \'bm25(0.0, 1, 1, 3, 5)\');')

    // Add triggers to keep movies tables in sync with FTS table
    // After Insert
    await sequelize.query(`
    CREATE TRIGGER IF NOT EXISTS movies_after_insert AFTER INSERT ON movies BEGIN
      INSERT INTO movies_fts(docid, ${searchFields}) SELECT rowid, ${searchFields} FROM movies WHERE is_conflict = 0 AND encryption_applied = 0 AND new.rowid = notes.rowid;
    END;`)

    // Before Update
    await sequelize.query(`
    CREATE TRIGGER IF NOT EXISTS movies_fts_before_update BEFORE UPDATE ON movies BEGIN
      DELETE FROM movies_fts WHERE docid=old.rowid;
    END
    `)

    // After Update
    await sequelize.query(`
    CREATE TRIGGER IF NOT EXISTS movies_after_update AFTER UPDATE ON movies BEGIN
      INSERT INTO movies_fts(docid, ${searchFields}) SELECT rowid, ${searchFields} FROM movies WHERE is_conflict = 0 AND encryption_applied = 0 AND new.rowid = notes.rowid;
    END
    `)

    // Before Delete
    await sequelize.query(`
    CREATE TRIGGER IF NOT EXISTS movies_fts_before_delete BEFORE DELETE ON movies BEGIN
      DELETE FROM movies_fts WHERE docid=old.rowid;
    END
    `)

    console.log('DB Full Text Search set up correctly')
  } catch (err) {
    console.error('Error syncing DB tables', err)
  }
}

// Find all .js files in this folder, excluding this very file
const modelFiles = glob.sync('*.js', {
  cwd: __dirname,
  ignore: path.basename(__filename)
})

for (const file of modelFiles) {
  const model = sequelize.import(path.join(__dirname, file))
  models[file.split('.')[0]] = model
}

/**
 * Declare models relationships
 */
models.Episode.belongsTo(models.Movie, {
  foreignKey: 'movieId'
})

/**
 * In production environment, automatically create tables on
 * app start-up
 */
if (config.isProduction) {
  sync()
}

models.sequelize = sequelize
models.sync = sync
module.exports = models
