// eslint-disable-next-line no-unused-vars
const Sequelize = require('sequelize')

/**
 * @param {Sequelize.Model} model
 */
const getResource = (model, options) =>
  async function getEpisode (ctx) {
    const id = parseInt(ctx.params.id)
    ctx.assert(id > 0, 404, 'Resource ID must be an integer > 0')

    const resource = await model.findByPk(id, options)

    ctx.assert(resource, 404)

    ctx.body = resource
  }

/**
 * @param {Sequelize.Model} model
 */
const updateResource = (model) =>
  async function (ctx) {
    const id = parseInt(ctx.params.id)
    ctx.assert(id > 0, 404, 'Resource ID must be an integer > 0')

    try {
      const [ count ] = await model.update(ctx.request.body, {
        where: { id }
      })

      ctx.status = count === 1 ? 204 : 400
    } catch (e) {
      ctx.status = 400
      ctx.body = e.message
    }
  }

module.exports = {
  getResource,
  updateResource
}
