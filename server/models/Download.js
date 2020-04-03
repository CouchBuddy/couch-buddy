const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  class Download extends Sequelize.Model {}

  Download.init({
    infoHash: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    magnetURI: {
      type: Sequelize.TEXT
    },
    name: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    done: {
      type: Sequelize.BOOLEAN
    }
  }, {
    sequelize,
    modelName: 'download'
  })

  return Download
}
