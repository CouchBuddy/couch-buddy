import npm from 'npm'

let npmLoaded = false

function loadNpm (): Promise<void> {
  return new Promise((resolve, reject) => {
    npm.load({}, (err) => {
      if (err) { return reject(err) }

      resolve()
    })
  })
}

export async function install (packageName: string): Promise<void> {
  if (!npmLoaded) {
    await loadNpm()
    npmLoaded = true
  }

  return new Promise((resolve, reject) => {
    npm.commands.install([ packageName ], (err, ...results) => {
      if (err) { return reject(err) }

      console.log(`Package ${packageName} installed`, results)
      resolve()
    })
  })
}
