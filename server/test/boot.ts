import path from 'path'

before('Initialize environment', function () {
  // load env vars from .env file
  require('dotenv').config({
    path: path.resolve(__dirname, '..', '.env')
  })

  // Initialize DB
  require('../models')
})
