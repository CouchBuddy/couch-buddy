const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  class Movie extends Sequelize.Model {}

  Movie.init({
    actors: {
      type: Sequelize.TEXT
    },
    awards: {
      type: Sequelize.TEXT
    },
    country: {
      type: Sequelize.TEXT
    },
    director: {
      type: Sequelize.TEXT
    },
    genre: {
      type: Sequelize.TEXT
    },
    imdbId: {
      type: Sequelize.TEXT
    },
    language: {
      type: Sequelize.TEXT
    },
    plot: {
      type: Sequelize.TEXT
    },
    poster: {
      type: Sequelize.TEXT,
      validate: { isUrl: true }
    },
    rated: {
      type: Sequelize.TEXT
    },
    ratingImdb: {
      type: Sequelize.FLOAT,
      validate: { min: 0, max: 10 }
    },
    ratingMetacritic: {
      type: Sequelize.INTEGER,
      validate: { min: 0, max: 100 }
    },
    ratingRottenTomatoes: {
      type: Sequelize.INTEGER,
      validate: { min: 0, max: 100 }
    },
    released: {
      type: Sequelize.TEXT
    },
    resolution: {
      type: Sequelize.INTEGER,
      validate: { min: 0 }
    },
    runtime: {
      type: Sequelize.INTEGER,
      validate: { min: 0 }
    },
    title: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    type: {
      type: Sequelize.TEXT,
      validate: { isIn: [['series', 'movie']] }
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
    modelName: 'movie'
  })

  return Movie
}