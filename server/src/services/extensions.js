const { Extension } = require('../models')

const allExtensions = []

async function init () {
  const extensions = await Extension.findAll({ where: { enabled: true } })

  for (const ext of extensions) {
    allExtensions.push({
      name: ext.name,
      search: require(ext.path).search
    })
  }
}

module.exports = {
  allExtensions,
  init
}
