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
    console.log('DB synced correctly')
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
models.Episode.belongsTo(models.Movie)

/**
 * In production environment, automatically create tables on
 * app start-up
 */
if (config.isProduction) {
  sync()
}

models.sync = sync
module.exports = models
