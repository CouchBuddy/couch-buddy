import { CouchBuddyExtension } from 'couch-buddy-extensions'

import Extension from '../models/Extension'

export const allExtensions: CouchBuddyExtension[] = []

export async function init () {
  const extensions = await Extension.find({ where: { enabled: true } })

  for (const ext of extensions) {
    allExtensions.push(require(ext.path) as CouchBuddyExtension)
  }
}
