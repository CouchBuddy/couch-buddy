import { Context } from 'koa'
import { container } from 'tsyringe'

import Extension from '../models/Extension'
import { listResource } from './rest-endpoints'
import ExtensionsService from '../services/extensions'

const extensionsService = container.resolve(ExtensionsService)

export const listExtensions = listResource(Extension)

export async function install (ctx: Context) {
  const name: string = ctx.request.body.name

  ctx.assert(name && name.length, 400, 'name is a required body param')

  try {
    await extensionsService.install(name)
    ctx.status = 204
  } catch (e) {
    ctx.status = 400
    ctx.body = e.message
  }
}
