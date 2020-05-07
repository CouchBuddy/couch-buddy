const Koa = require('koa')
const koaBody = require('koa-body')
const koaMount = require('koa-mount')
const koaStatic = require('koa-static')
const koaCors = require('@koa/cors')
import 'reflect-metadata'

// Initialize config
const config = require('./config')
// Initialize DB
require('./models')
// Initialize services
require('./services')
const server = require('./services/server')

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
  app.use(require('./middlewares/spa-rewrite')('api', '/'))
}

const router = require('./routes')
app.use(koaMount('/api', router.routes()))
app.use(koaMount('/api', router.allowedMethods()))

server.on('request', app.callback())
