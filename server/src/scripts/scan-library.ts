#!/usr/bin/env ts-node

import { ArgumentParser } from 'argparse'
import assert from 'assert'
import { SingleBar } from 'cli-progress'

import boot from './boot'
import { addFileToLibrary, scanDirectory } from '../services/library'

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

function main (bar: SingleBar) {
  switch (args.cmd) {
    case 'add':
      assert(args.file, 'File argument required')

      addFileToLibrary(args.file, args.force).then(movie => {
        console.log(movie)
      })
      break

    case 'scan':
      scanDirectory(args.file)
      break

    default:
      console.log('Unsupported command', args.cmd)
      break
  }
}

if (require.main === module) {
  (async function () {
    await main(await boot())
    process.exit(0)
  })()
}
