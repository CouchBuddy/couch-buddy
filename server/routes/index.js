const router = require('@koa/router')()

const library = require('./library')
const streaming = require('./streaming')

router.get('/library', library.listLibrary)
router.get('/library/:id', library.getLibrary)
router.post('/library/scan', library.scanLibrary)
router.get('/episodes/:id', library.listEpisodes)

router.get('/watch/:id', streaming.watch)

module.exports = router
