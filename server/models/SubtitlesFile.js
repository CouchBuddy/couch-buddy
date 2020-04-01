const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  class SubtitlesFile extends Sequelize.Model {}

  SubtitlesFile.init({
    fileName: {
      type: Sequelize.TEXT,
      allowNull: false
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
