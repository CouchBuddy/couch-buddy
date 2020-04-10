const Koa = require('koa')
const koaBody = require('koa-body')
const koaMount = require('koa-mount')
const koaStatic = require('koa-static')
const koaCors = require('@koa/cors')

// Initialize config
const config = require('./config')

// Initialize DB
require('./models')

const app = new Koa()

app.use(require('koa-logger')())

app.proxy = true
app.use(koaCors({ credentials: true }))
app.use(koaBody({
  formidable: {
    uploadDir: 'uploads/'
  },
  multipart: true,
  urlencoded: true
}))

app.use(koaStatic('public'))
app.use(koaMount('/uploads', koaStatic('uploads')))

const router = require('./routes')
app.use(koaMount('/api', router.routes()))
app.use(koaMount('/api', router.allowedMethods()))

app.listen(config.port, async () => {
  console.log(`Server running on port ${config.port}`)
})
