import path from 'path'
import { getConnection } from 'typeorm'

import { destroy } from '../src/services'

before('Initialize environment', function () {
  // load env vars from .env file
  require('dotenv').config({
    path: path.resolve(__dirname, '..', '.env')
  })

  // Initialize DB
  require('../models')
})

after(async function () {
  await getConnection().close()

  await destroy()
})
