import chai from 'chai'
import chaiHttp from 'chai-http'
import faker from 'faker'

import server from '../src/app'
import Movie from '../src/models/Movie'

chai.use(chaiHttp)
const expect = chai.expect

describe('REST API', function () {
  let client: ChaiHttp.Agent

  before(async function () {
    client = chai.request(server).keepOpen()

    for (let i = 0; i < 50; i++) {
      await Movie.create({
        title: faker.commerce.productName(),
        type: 'movie'
      }).save()
    }
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
      expect(res.body).to.have.lengthOf(30)
    })

    it('should page results', async function () {
      const res = await client.get('/api/library')
        .query({ page: 2 })

      expect(res).to.have.status(200)
      expect(res).to.be.json
      expect(res.body).to.be.an('array')
      expect(res.body).to.have.property('length', 20)
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

  describe('PATCH /library/<id>', function () {
    it('should update a movie', async function () {
      const newTitle = 'La grande bellezza'

      const res = await client.patch('/api/library/3')
        .send({ title: newTitle })

      expect(res, res.error.message).to.have.status(204)
      expect(res.body).to.be.empty

      expect(await Movie.findOne(3)).to.have.property('title', newTitle)
    })
  })
})
