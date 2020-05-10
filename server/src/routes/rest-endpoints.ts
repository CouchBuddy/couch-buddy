import { Context, Middleware } from 'koa'
import { Repository } from 'typeorm'

/**
 * Get a resource by its ID
 *
 * @param repository Get the entity repository calling `.getRepository()` on the class
 */
export const getResource = <T>(repository: Repository<T>): Middleware =>
  async function (ctx: Context) {
    const id = parseInt(ctx.params.id)
    ctx.assert(id > 0 || ctx.params.id === 'random', 404, 'Resource ID must be an integer > 0')

    const resource = await repository
      .findOne(id)

    ctx.assert(resource, 404)

    ctx.body = resource
  }

/**
 * List resources
 *
 * @param repository Get the entity repository calling `.getRepository()` on the class
 */
export const listResource = <T>(repository: Repository<T>): Middleware =>
  async function (ctx: Context) {
    ctx.body = await repository.find({
      take: 30
    })
  }

/**
 * Update a resource by its ID
 *
 * @param repository Get the entity repository calling `.getRepository()` on the class
 */
export const updateResource = <T>(repository: Repository<T>): Middleware =>
  async function (ctx: Context) {
    const id = parseInt(ctx.params.id)
    ctx.assert(id > 0, 404, 'Resource ID must be an integer > 0')

    try {
      const result = await repository.update(id, ctx.request.body)

      ctx.status = result.affected === 1 ? 204 : 400
    } catch (e) {
      ctx.status = 400
      ctx.body = e.message
    }
  }

function pick (o: Map<string, any>, ...props: string[]) {
  return Object.assign({}, ...props.map(prop => ({ [prop]: o.get(prop) })))
}
