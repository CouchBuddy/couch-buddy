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

  private async loadExtension (path: string): Promise<boolean> {
    try {
      const Module = (await import(path)).default
      const extension: CouchBuddyExtension = new Module()

      allExtensions.push(extension)
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

    const existingExtension = await Extension.findOne({ name: extension.name })
    if (existingExtension) {
      extension.id = existingExtension.id
    }

    // Load the package and enable it only if the loading is successful
    extension.enabled = await this.loadExtension(extension.path)

    await extension.save()

    return extension
  }
}
