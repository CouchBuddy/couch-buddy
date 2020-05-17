import { CouchBuddyExtension } from 'couch-buddy-extensions'

import Extension from '../models/Extension'
import * as npm from './npm'
import Service from './Service'

export const allExtensions: CouchBuddyExtension[] = []

export default class ExtensionsService extends Service {
  async init () {
    const extensions = await Extension.find({ where: { enabled: true } })

    for (const ext of extensions) {
      this.loadExtension(ext.path)
    }
  }

  async destroy (): Promise<void> {
    return null
  }

  private loadExtension (path: string): boolean {
    try {
      allExtensions.push(require(path) as CouchBuddyExtension)
      return true
    } catch (e) {
      console.log('Error loading extension', e)
      return false
    }
  }

  /**
   * Install an extension
   *
   * @param packageName any package name supported by npm CLI,
   *   as in `npm install <name_here>`
   */
  async install (packageName: string): Promise<Extension> {
    const extension = await npm.install(packageName)

    // Load the package and enable it only if the loading is successful
    extension.enabled = this.loadExtension(extension.path)

    await extension.save()

    return extension
  }
}
