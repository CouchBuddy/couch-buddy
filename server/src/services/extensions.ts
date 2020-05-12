import { CouchBuddyExtension } from 'couch-buddy-extensions'
import path from 'path'

import Extension from '../models/Extension'
import * as npm from './npm'

export const allExtensions: CouchBuddyExtension[] = []

function loadExtension (path: string): void {
  allExtensions.push(require(path) as CouchBuddyExtension)
}

export async function init () {
  const extensions = await Extension.find({ where: { enabled: true } })

  for (const ext of extensions) {
    loadExtension(ext.path)
  }
}

export async function install (extensionName: string): Promise<void> {
  await npm.install(extensionName)

  const savedExtension = Extension.create({
    enabled: true,
    name: extensionName,
    path: path.join('node_modules', extensionName)
  })

  loadExtension(savedExtension.path)
}
