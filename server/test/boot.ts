import { getConnection } from 'typeorm'

import { init as initServices, destroy } from '../src/services'
import { init as initDB } from '../src/models'

before('Initialize env', async function () {
  await initDB()
  await initServices()

  // Drop the tables and sync the db
  await getConnection().synchronize(true)
})

after('Teardown env', async function () {
  await getConnection().close()

  await destroy()
})
