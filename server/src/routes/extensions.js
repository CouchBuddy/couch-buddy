const sendFile = require('koa-send')
const path = require('path')

const { Extension } = require('../models')
const { listResource } = require('./rest-endpoints')

const listExtensions = listResource(Extension)

const loadExtension = async (ctx) => {
  const id = parseInt(ctx.params.id)
  ctx.assert(id > 0, 404, 'Resource ID must be an integer > 0')

  const extension = await Extension.findByPk(id)

  ctx.assert(extension, 404)

  await sendFile(ctx, `${extension.name}.umd.min.js`, { root: path.join(extension.path, 'dist') })
}

module.exports = {
  listExtensions,
  loadExtension
}
