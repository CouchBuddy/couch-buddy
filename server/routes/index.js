const router = require('@koa/router')()

const library = require('./library')
const streaming = require('./streaming')

router.get('/library', library.listLibrary)
router.get('/library/:id', library.getLibrary)
router.post('/library/scan', library.scanLibrary)
router.get('/library/:id/episodes', library.listEpisodes)
router.get('/episodes/:id', library.getEpisode)

router.get('/watch/:id', streaming.watch)

module.exports = router
