const assert = require('assert')

require('./boot')
const { addFileToLibrary, scanLibrary } = require('../routes/library')

const file = process.argv[3]

switch (process.argv[2]) {
  case 'add':
    assert(file, 'File argument required')

    addFileToLibrary(file).then(movie => {
      console.log(movie)
    })
    break

  case 'scan':
    scanLibrary()
    break

  default:
    console.log('Unsupported command', process.argv[2])
    break
}
