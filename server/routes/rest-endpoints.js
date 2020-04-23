// eslint-disable-next-line no-unused-vars
const Sequelize = require('sequelize')

/**
 * @param {Sequelize.Model} model
 */
const getResource = (model, baseOptions = {}) =>
  async function (ctx) {
    const id = parseInt(ctx.params.id)
    ctx.assert(id > 0 || ctx.params.id === 'random', 404, 'Resource ID must be an integer > 0')

    const options = pick(ctx.request.query, 'include', 'where')

    let resource

    if (isFinite(id)) {
      resource = await model.findByPk(id, Object.assign(baseOptions, options))
    } else {
      resource = await model.findOne({ order: [[ Sequelize.literal('RANDOM()') ]], limit: 1 })
    }

    ctx.assert(resource, 404)

    ctx.body = resource
  }

const listResource = (model, options = {}) =>
  async function (ctx) {
    ctx.body = await model.findAll(options)
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

function pick (o, ...props) {
  return Object.assign({}, ...props.map(prop => ({ [prop]: o[prop] })))
}

module.exports = {
  getResource,
  listResource,
  updateResource
}
