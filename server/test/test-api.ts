import chai from 'chai'
import chaiHttp from 'chai-http'
import faker from 'faker'
import { container } from 'tsyringe'
import { Torrent } from 'webtorrent'

import server from '../src/app'
import Episode from '../src/models/Episode'
import Movie, { MovieType } from '../src/models/Movie'
import Downloader from '../src/services/downloader'
import Download from '../src/models/Download'

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

  describe('GET /collections/recently-added', function () {
    it('should list the latest 10 movies added', async function () {
      const res = await client.get('/api/collections/recently-added')

      expect(res).to.have.status(200)
      expect(res.body).to.be.an('array')
      expect(res.body).to.have.lengthOf(20)
    })
  })

  describe('GET /collections/continue-watching', function () {
    it('should list movies the user didn\'t fully watch', async function () {
      const res = await client.get('/api/collections/continue-watching')

      expect(res).to.have.status(200)
      expect(res.body).to.be.an('array')
      expect(res.body).to.have.lengthOf(10)
      for (const movieOrEpisode of res.body) {
        expect(movieOrEpisode.watched).to.be.within(0.1, 94.9)
      }
    })
  })

  describe('GET /downloads', function () {
    it('should list active downloads', async function () {
      const res = await client.get('/api/downloads')

      expect(res).to.have.status(200)
      expect(res.body).to.be.an('array')
    })
  })

  describe('POST /downloads', function () {
    it('should add a torrent from magnet link', async function () {
      const res = await client.post('/api/downloads')
        .send({ magnetURI: 'magnet:?xt=urn:btih:dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c&dn=Big+Buck+Bunny&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fbig-buck-bunny.torrent' })

      expect(res, res.body).to.have.status(200)
      expect(res.body).to.be.an('object')
      expect(res.body).to.have.property('infoHash', 'dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c')

      const downloader = container.resolve(Downloader)

      const torrent: Torrent = downloader.client.get(res.body.infoHash) || null
      expect(torrent).not.to.be.null
      torrent.pause()

      const downloadEntity = await Download.findOne({ infoHash: 'dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c' })
      expect(downloadEntity).not.to.be.null
    })
  })
})
