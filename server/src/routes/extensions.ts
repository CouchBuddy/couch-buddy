import Extension from '../models/Extension'
import { listResource } from './rest-endpoints'

export const listExtensions = listResource(Extension)
