const router = require('@koa/router')()

const downloads = require('./downloads')
const library = require('./library')
const streaming = require('./streaming')

router.get('/library', library.listLibrary)
router.get('/library/:id', library.getLibrary)
router.post('/library/scan', library.scanLibrary)
router.get('/library/:id/episodes', library.listEpisodes)
router.get('/episodes/:id', library.getEpisode)

router.get('/watch/:id', streaming.watch)
router.get('/watch/:wid/subtitles', streaming.listSubtitles)
router.get('/subtitles/:id', streaming.getSubtitles)
router.post('/subtitles/:wid/download', streaming.downloadSubtitles)

router.post('/downloads', downloads.addTorrent)
router.get('/downloads', downloads.listTorrents)

module.exports = router
