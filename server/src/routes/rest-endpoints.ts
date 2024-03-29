import { Context, Middleware } from 'koa'
import { Repository } from 'typeorm'

/**
 * Get a resource by its ID
 *
 * @param repository Get the entity repository calling `.getRepository()` on the class
 */
export const getResource = <T>(entity: { getRepository(): Repository<T> }): Middleware =>
  async function (ctx: Context) {
    const id: number | 'random' = parseInt(ctx.params.id) || ctx.params.id

    ctx.assert(id > 0 || ctx.params.id === 'random', 400, 'Resource ID must be an integer > 0')

    let resource: T
    if (id === 'random') {
      resource = await entity.getRepository()
        .createQueryBuilder()
        .orderBy('RANDOM()')
        .limit(1)
        .getOne()
    } else {
      const relations = ctx.query.__relations
        ? Array.isArray(ctx.query.__relations) ? ctx.query.__relations : [ctx.query.__relations]
        : []

      resource = await entity.getRepository().findOne(id, {
        relations
      })
    }

    ctx.assert(resource, 404)

    ctx.body = resource
  }

/**
 * List resources
 *
 * @param repository Get the entity repository calling `.getRepository()` on the class
 */
export const listResource = <T>(entity: { getRepository(): Repository<T> }): Middleware =>
  async function (ctx: Context) {
    const pageSize = 30
    const page = ctx.query.page && !Array.isArray(ctx.query.page)
      ? parseInt(ctx.query.page)
      : 1

    ctx.assert(page >= 1, 400, 'page argument must be >= 1')

    ctx.body = await entity.getRepository().find({
      skip: (page - 1) * pageSize,
      take: pageSize
    })
  }

/**
 * Create a resource
 *
 * @param repository Get the entity repository calling `.getRepository()` on the class
 */
 export const createResource = <T>(entity: { getRepository(): Repository<T> }): Middleware =>
 async function (ctx: Context) {
   try {
     const result = await entity.getRepository().insert(ctx.request.body)
     const insertedId = result.identifiers[0]

     ctx.status = 201
     ctx.body = { ...ctx.request.body, id: insertedId }
   } catch (e) {
     ctx.status = 400
     ctx.body = e.message
   }
 }

/**
 * Update a resource by its ID
 *
 * @param repository Get the entity repository calling `.getRepository()` on the class
 */
export const updateResource = <T>(entity: { getRepository(): Repository<T> }): Middleware =>
  async function (ctx: Context) {
    const id = parseInt(ctx.params.id)
    ctx.assert(id > 0, 400, 'Resource ID must be an integer > 0')

    try {
      await entity.getRepository().update(id, ctx.request.body)

      ctx.status = 204
    } catch (e) {
      ctx.status = 400
      ctx.body = e.message
    }
  }
