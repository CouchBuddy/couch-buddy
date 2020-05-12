import { Context, Next } from 'koa'

export default function spaRewrite (apiPathPrefix: string, rewritePath: string) {
  const apiPathPrefixRegEx = new RegExp(`${apiPathPrefix}.+/?`)
  return async (ctx: Context, next: Next) => {
    if (
      // Not an API request
      !apiPathPrefixRegEx.test(ctx.url) &&
      // Not an asset request (image, css, js, anythingwith.ext)
      !ctx.url.match(/\.\S{2,4}$/) &&
      // Not a webpack HMR request
      !ctx.url.match(/webpack_hmr/)
    ) {
      ctx.url = rewritePath
    }
    await next()
  }
}
