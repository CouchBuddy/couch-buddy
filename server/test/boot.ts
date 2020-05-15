import { getConnection } from 'typeorm'

import { init as initServices, destroy } from '../src/services'
import { init as initDB } from '../src/models'

before('Initialize env', async function () {
  this.timeout(10000)

  await initDB()

  try {
    // Drop the tables and sync the db
    await getConnection().synchronize(true)
  } catch (e) {}

  await initServices()
})

after('Teardown env', async function () {
  await getConnection().close()

  await destroy()
})
