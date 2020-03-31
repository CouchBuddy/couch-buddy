const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  class MediaFile extends Sequelize.Model {}

  MediaFile.init({
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
    },
    mimeType: {
      type: Sequelize.TEXT,
      validate: { is: /^[-\w.]+\/[-\w.+]+$/ },
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'mediaFile'
  })

  return MediaFile
}
