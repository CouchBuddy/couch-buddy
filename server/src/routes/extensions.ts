import { Context } from 'koa'
import sendFile from 'koa-send'
import path from 'path'

import Extension from '../models/Extension'
import { listResource } from './rest-endpoints'

export const listExtensions = listResource(Extension.getRepository())

export const loadExtension = async (ctx: Context) => {
  const id = parseInt(ctx.params.id)
  ctx.assert(id > 0, 404, 'Resource ID must be an integer > 0')

  const extension = await Extension.findOne(id)

  ctx.assert(extension, 404)

  await sendFile(ctx, `${extension.name}.umd.min.js`, { root: path.join(extension.path, 'dist') })
}
