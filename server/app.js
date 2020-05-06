const Koa = require('koa')
const koaBody = require('koa-body')
const koaMount = require('koa-mount')
const koaStatic = require('koa-static')
const koaCors = require('@koa/cors')

// Initialize config
const config = require('./src/config')
// Initialize DB
require('./src/models')
// Initialize services
require('./src/services')
const server = require('./src/services/server')

const app = new Koa()

app.use(require('koa-logger')())

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
  app.use(require('./src/middlewares/spa-rewrite')('api', '/'))
}

const router = require('./src/routes')
app.use(koaMount('/api', router.routes()))
app.use(koaMount('/api', router.allowedMethods()))

server.on('request', app.callback())
