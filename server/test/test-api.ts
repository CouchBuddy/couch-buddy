import chai from 'chai'
import chaiHttp from 'chai-http'

import server from '../src/app'

chai.use(chaiHttp)
const expect = chai.expect

describe('REST API', function () {
  let client: ChaiHttp.Agent

  before(function () {
    client = chai.request(server).keepOpen()
  })

  after(function (done) {
    client.close(done)
  })

  describe('GET /library', function () {
    it('should get a list of movies', async function () {
      const res = await client.get('/api/library')

      expect(res).to.have.status(200)
      expect(res).to.be.json
      expect(res.body).to.be.an('array')
    })
  })

  describe('GET /library/<id>', function () {
    it('should get a movie details', async function () {
      const res = await client.get('/api/library/1')

      expect(res).to.have.status(200)
      expect(res).to.be.json
      expect(res.body).to.be.an('object')
      expect(res.body).to.have.property('id', 1)
    })

    it('should get a random movie details', async function () {
      const res = await client.get('/api/library/random')

      expect(res).to.have.status(200)
      expect(res).to.be.json
      expect(res.body).to.be.an('object')
      expect(res.body).to.haveOwnProperty('id')
    })

    it('should not accept invalid IDs', async function () {
      expect(await client.get('/api/library/-15')).to.have.status(400)
      expect(await client.get('/api/library/0')).to.have.status(400)
      expect(await client.get('/api/library/ciao')).to.have.status(400)
    })
  })
})
