const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  class Episode extends Sequelize.Model {}

  Episode.init({
    actors: {
      type: Sequelize.TEXT
    },
    director: {
      type: Sequelize.TEXT
    },
    episode: {
      type: Sequelize.INTEGER,
      validate: { min: 1 }
    },
    firstAired: {
      type: Sequelize.TEXT
    },
    plot: {
      type: Sequelize.TEXT
    },
    poster: {
      type: Sequelize.TEXT,
      validate: { isUrl: true }
    },
    ratingImdb: {
      type: Sequelize.FLOAT,
      validate: { min: 0, max: 10 }
    },
    ratingMetascore: {
      type: Sequelize.INTEGER,
      validate: { min: 0, max: 100 }
    },
    ratingRottenTomatoes: {
      type: Sequelize.INTEGER,
      validate: { min: 0, max: 100 }
    },
    resolution: {
      type: Sequelize.INTEGER,
      validate: { min: 0 }
    },
    runtime: {
      type: Sequelize.INTEGER,
      validate: { min: 0 }
    },
    season: {
      type: Sequelize.INTEGER,
      validate: { min: 1 }
    },
    thumbnail: {
      type: Sequelize.TEXT
    },
    title: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    watched: {
      type: Sequelize.INTEGER,
      validate: { min: 0, max: 100 }
    },
    writer: {
      type: Sequelize.TEXT
    },
    year: {
      type: Sequelize.INTEGER,
      validate: { min: 1900 }
    }
  }, {
    sequelize,
    modelName: 'episode'
  })

  return Episode
}
