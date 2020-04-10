const ArgumentParser = require('argparse').ArgumentParser
const assert = require('assert')

require('./boot')
const { addFileToLibrary, scanLibrary } = require('../services/library')

const parser = new ArgumentParser({
  addHelp: true,
  description: 'Scan Library utility'
})

parser.addArgument('cmd', {
  choices: [ 'add', 'scan' ]
})

parser.addArgument('file', {
})

parser.addArgument(
  [ '--force' ],
  {
    help: 'Update a movie or episode info even if a file has already been indexed',
    action: 'storeTrue'
  }
)

const args = parser.parseArgs()

switch (args.cmd) {
  case 'add':
    assert(args.file, 'File argument required')

    addFileToLibrary(args.file, args.force).then(movie => {
      console.log(movie)
    })
    break

  case 'scan':
    scanLibrary()
    break

  default:
    console.log('Unsupported command', args.cmd)
    break
}
