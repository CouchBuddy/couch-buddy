import chai from 'chai'
import chaiHttp from 'chai-http'
import faker from 'faker'

import server from '../src/app'
import Episode from '../src/models/Episode'
import Movie, { MovieType } from '../src/models/Movie'

/**
 *
router.get('/library/find-info', library.findMovieInfo)
OK router.get('/library', library.listLibrary)
OK router.get('/library/:id', library.getLibrary)
OK router.patch('/library/:id', library.updateLibrary)
OK router.get('/library/:id/episodes', library.listEpisodes)
OK router.get('/episodes/:id', library.getEpisode)
router.get('/episodes/:id/thumbnail', library.getEpisodeThumbnail)
OK router.patch('/episodes/:id', library.updateEpisode)
router.post('/library/scan', library.scanLibrary)
router.get('/search', library.search)
 */

chai.use(chaiHttp)
const expect = chai.expect

describe('REST API', function () {
  let client: ChaiHttp.Agent

  before(async function () {
    client = chai.request(server).keepOpen()

    /**
     * Create a fake library
     */

    /**
     * ID[1..40]
     * 40 Movies
     * from 0 to 9: watching
     * from 10 to 19: watched
     * from 20: not watched
     */
    for (let i = 0; i < 40; i++) {
      await Movie.create({
        title: faker.commerce.productName(),
        type: MovieType.Movie,
        watched: i < 10 ? 50 : (i < 20 ? 100 : 0)
      }).save()
    }

    /**
     * ID[41..50]
     * 10 Series with 10 episodes each
     */
    for (let i = 0; i < 10; i++) {
      const episodes = []

      for (let j = 0; j < 10; j++) {
        episodes.push(Episode.create({
          title: faker.commerce.productName(),
          season: 1,
          episode: j + 1
        }))
      }

      await Movie.create({
        title: faker.commerce.productName(),
        type: MovieType.Series,
        episodes
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

  describe('GET /library/<id>/episodes', function () {
    it('should list series episodes', async function () {
      const res = await client.get('/api/library/45/episodes')

      expect(res).to.have.status(200)
      expect(res).to.be.json
      expect(res.body).to.be.an('array')
      expect(res.body).to.have.lengthOf(10)
    })
  })

  describe('GET /episodes/<id>', function () {
    it('should get an episode details', async function () {
      const res = await client.get('/api/episodes/7')

      expect(res).to.have.status(200)
      expect(res).to.be.json
      expect(res.body).to.be.an('object')
      expect(res.body).to.have.property('id', 7)
      expect(res.body).to.have.property('season')
      expect(res.body).to.have.property('episode')
    })

    it('should not accept invalid IDs', async function () {
      expect(await client.get('/api/library/-15')).to.have.status(400)
      expect(await client.get('/api/library/0')).to.have.status(400)
      expect(await client.get('/api/library/ciao')).to.have.status(400)
    })
  })

  describe('PATCH /episodes/<id>', function () {
    it('should update an episode', async function () {
      const newTitle = 'Gran Finale'
      const newEpisodeNumber = 15

      const res = await client.patch('/api/episodes/3')
        .send({ title: newTitle, episode: newEpisodeNumber })

      expect(res, res.error.message).to.have.status(204)
      expect(res.body).to.be.empty

      const updatedEpisode = await Episode.findOne(3)
      expect(updatedEpisode).to.have.property('title', newTitle)
      expect(updatedEpisode).to.have.property('episode', newEpisodeNumber)
    })
  })
})
