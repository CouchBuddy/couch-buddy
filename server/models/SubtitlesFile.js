const Sequelize = require('sequelize')
const ISO6391 = require('iso-639-1')

module.exports = (sequelize) => {
  class SubtitlesFile extends Sequelize.Model {}

  SubtitlesFile.init({
    fileName: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    lang: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    langName: {
      type: Sequelize.VIRTUAL,
      get () { return ISO6391.getName(this.lang) }
    },
    mediaId: {
      type: Sequelize.INTEGER,
      validate: { min: 1 },
      allowNull: false
    },
    mediaType: {
      type: Sequelize.TEXT,
      validate: { isIn: [[ 'episode', 'movie' ]] },
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'subtitlesFile'
  })

  return SubtitlesFile
}
