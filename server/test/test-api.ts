import chai from 'chai'
import chaiHttp from 'chai-http'

import server from '../src/app'

chai.use(chaiHttp)
const expect = chai.expect

describe('REST API', function () {
  describe('GET /library', function () {
    it('should get a list of movies', async function () {
      const res = await chai.request(server)
        .get('/api/library')

      expect(res).to.have.status(200)
      expect(res).to.be.json
      expect(res.body).to.be.an('array')
    })
  })
})
