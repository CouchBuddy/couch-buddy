const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  class Extension extends Sequelize.Model {}

  Extension.init({
    enabled: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    name: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    path: {
      type: Sequelize.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'extension'
  })

  return Extension
}
