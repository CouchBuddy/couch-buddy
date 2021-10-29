import Library from '../models/Library'
import { createResource, getResource, listResource, updateResource } from './rest-endpoints'

export const getLibrary = getResource(Library)
export const listLibraries = listResource(Library)
export const createLibraries = createResource(Library)
export const updateLibrary = updateResource(Library)
