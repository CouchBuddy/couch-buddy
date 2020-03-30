const Koa = require('koa')
const koaBody = require('koa-body')
const koaMount = require('koa-mount')
const koaStatic = require('koa-static')
const koaCors = require('@koa/cors')

// load env vars from .env file
require('dotenv').config()

const router = require('./routes')
// require('./src/db')

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

app.use(koaMount('/api', router.routes()))
app.use(koaMount('/api', router.allowedMethods()))

const PORT = process.env.PORT || 3000
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`)
})
