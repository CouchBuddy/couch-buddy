const { Extension } = require('../models')

const allExtensions: Extension[] = []

async function init () {
  const extensions = await Extension.findAll({ where: { enabled: true } })

  for (const ext of extensions) {
    allExtensions.push({
      name: ext.name,
      search: require(ext.path).search
    })
  }
}

interface Extension {
  name: string;
  search(query: string): any[];
}

module.exports = {
  allExtensions,
  init
}
