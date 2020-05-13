import boot from './boot'
import { getConnection } from 'typeorm'

async function main (bar: any) {
  getConnection().synchronize(false)
}

if (require.main === module) {
  (async function () {
    await main(await boot())
    process.exit(0)
  })()
}
