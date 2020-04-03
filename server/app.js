const Koa = require('koa')
const koaBody = require('koa-body')
const koaMount = require('koa-mount')
const koaStatic = require('koa-static')
const koaCors = require('@koa/cors')

// load env vars from .env file
require('dotenv').config()

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

const PORT = process.env.PORT || 3000
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`)
  printIPs()
})

function printIPs () {
  var os = require('os')
  var ifaces = os.networkInterfaces()

  Object.keys(ifaces).forEach(function (ifname) {
    var alias = 0

    ifaces[ifname].forEach(function (iface) {
      if (iface.family !== 'IPv4' || iface.internal !== false) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return
      }

      if (alias >= 1) {
        // this single interface has multiple ipv4 addresses
        console.log(ifname + ':' + alias, iface.address)
      } else {
        // this interface has only one ipv4 adress
        console.log(iface.address)
      }
      ++alias
    })
  })
}
