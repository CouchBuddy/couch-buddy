import Koa from 'koa'
import koaBody from 'koa-body'
import koaCors from '@koa/cors'
import koaLogger from 'koa-logger'
import koaMount from 'koa-mount'
import koaStatic from 'koa-static'
import 'reflect-metadata'

// Initialize config
import config from './config'

// Initialize DB
import { init as initDB } from './models'

import router from './routes'

// Initialize services
import { init as initServices } from './services'
import server, { init as startServer } from './services/server'

import spaRewrite from './middlewares/spa-rewrite'

const app = new Koa()

if (!config.isTest) {
  app.use(koaLogger())
}

app.proxy = true
app.use(koaCors({ credentials: true }))
app.use(koaBody({
  formidable: {},
  multipart: true,
  urlencoded: true
}))

app.use(koaStatic('public'))

if (config.isProduction) {
  // In production, Vue SPA client is served by the server,
  // so all URLs but /api and static files are rewritten to / and handled by the SPA
  app.use(spaRewrite('api', '/'))
}

app.use(koaMount('/api', router.routes()))
app.use(koaMount('/api', router.allowedMethods()))

server.on('request', app.callback())

async function init () {
  await initDB()
  await initServices()
  await startServer()
}

if (require.main === module) {
  init()
}

export default server
