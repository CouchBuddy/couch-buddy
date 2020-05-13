import { CouchBuddyExtension } from 'couch-buddy-extensions'
import path from 'path'

import Extension from '../models/Extension'
import * as npm from './npm'
import Service from './Service'

export const allExtensions: CouchBuddyExtension[] = []

export default class Extensions extends Service {
  async init () {
    const extensions = await Extension.find({ where: { enabled: true } })

    for (const ext of extensions) {
      this.loadExtension(ext.path)
    }
  }

  async destroy (): Promise<void> {
    return null
  }

  loadExtension (path: string): void {
    allExtensions.push(require(path) as CouchBuddyExtension)
  }

  async install (extensionName: string): Promise<void> {
    await npm.install(extensionName)

    const savedExtension = await Extension.create({
      enabled: true,
      name: extensionName,
      path: path.join('node_modules', extensionName)
    }).save()

    this.loadExtension(savedExtension.path)
  }
}
