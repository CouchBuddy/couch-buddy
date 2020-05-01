before('Initialize environment', function () {
  const path = require('path')

  // load env vars from .env file
  require('dotenv').config({
    path: path.resolve(__dirname, '../.env')
  })

  // Initialize DB
  require('../models')
})
