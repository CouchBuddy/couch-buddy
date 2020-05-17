import npm from 'npm'

import Extension from '../models/Extension'

let npmLoaded = false

function loadNpm (): Promise<void> {
  return new Promise((resolve, reject) => {
    npm.load({
      save: false
    }, (err) => {
      if (err) { return reject(err) }

      resolve()
    })
  })
}

export async function install (packageName: string): Promise<Extension> {
  if (!npmLoaded) {
    await loadNpm()
    npmLoaded = true
  }

  return new Promise((resolve, reject) => {
    npm.commands.install([ packageName ], (err, results: string[][]) => {
      // results from npm.install() is this:
      // [
      //   [ 'fsevents@2.1.2', '/home/luca/dev/couch-buddy/server/node_modules/fsevents' ],
      //   [ 'couch-buddy-movies-explorer@1.0.1', '/home/luca/dev/couch-buddy/server/node_modules/couch-buddy-movies-explorer' ]
      // ]
      if (err) { return reject(err) }

      const installedPackage = results.pop()
      const [ name, version ] = installedPackage[0].split(/(?<!^)@/)

      const extension = Extension.create({
        name,
        path: installedPackage[1],
        version
      })

      resolve(extension)
    })
  })
}
