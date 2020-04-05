const glob = require('glob')
const path = require('path')
const Sequelize = require('sequelize')

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'db.sqlite',
  logging: false
})

const models = {}

async function sync () {
  try {
    await sequelize.authenticate()
    console.log('Connected to DB')
  } catch (err) {
    console.error('Error while connecting and syncing database:', err)
  }

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

// for (const modelName in models) {
//   if (models[modelName].associate) {
//     models[modelName].associate(models)
//   }
// }

models.Episode.belongsTo(models.Movie)

models.sync = sync
module.exports = models
