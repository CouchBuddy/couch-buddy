import { getConnection } from 'typeorm'

import { init as initServices, destroy } from '../src/services'
import { init as initDB } from '../src/models'

before('Initialize env', async function () {
  // Sync DB
  await initDB(true)
  await initServices()
})

after('Teardown env', async function () {
  await getConnection().close()

  await destroy()
})
