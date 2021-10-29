import fs from 'fs'

import Library from '../models/Library'
import { createResource, getResource, listResource, updateResource } from './rest-endpoints'

export const getLibrary = getResource(Library)
export const listLibraries = listResource(Library)
export const createLibraries = createResource(Library)
export const updateLibrary = updateResource(Library)

const isFolderAvailable = async (path: string): Promise<boolean> => {
  try {
    await fs.promises.access(path, fs.constants.R_OK | fs.constants.W_OK)
    return true
  } catch (e) {
    return false
  }
}
