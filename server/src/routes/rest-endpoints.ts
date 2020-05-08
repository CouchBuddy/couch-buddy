import { Context } from 'koa'
import { getRepository, EntitySchema } from 'typeorm'

/**
 * @param model
 */
export const getResource = <T extends EntitySchema>(model: T) =>
  async function (ctx: Context) {
    const id = parseInt(ctx.params.id)
    ctx.assert(id > 0 || ctx.params.id === 'random', 404, 'Resource ID must be an integer > 0')

    const resource = await getRepository(model)
      .createQueryBuilder(model.options.name)
      .where('id = :id', { id })
      .getOne()

    ctx.assert(resource, 404)

    ctx.body = resource
  }

export const listResource = <T extends EntitySchema>(model: T) =>
  async function (ctx: Context) {
    const resources = await getRepository(model)
      .createQueryBuilder(model.options.name)
      .take(30)
      .getMany()

    ctx.body = resources
  }

/**
 * @param model
 */
export const updateResource = <T extends EntitySchema>(model: T) =>
  async function (ctx: Context) {
    const id = parseInt(ctx.params.id)
    ctx.assert(id > 0, 404, 'Resource ID must be an integer > 0')

    try {
      const result = await getRepository(model)
        .createQueryBuilder(model.options.name)
        .update()
        .set(ctx.request.body)
        .where({ id })
        .execute()

      ctx.status = result.affected === 1 ? 204 : 400
    } catch (e) {
      ctx.status = 400
      ctx.body = e.message
    }
  }

function pick (o: Map<string, any>, ...props: string[]) {
  return Object.assign({}, ...props.map(prop => ({ [prop]: o.get(prop) })))
}
