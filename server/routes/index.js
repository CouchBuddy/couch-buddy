const router = require('@koa/router')()

const downloads = require('./downloads')
const extensions = require('./extensions')
const library = require('./library')
const collections = require('./media-collections')
const streaming = require('./streaming')
const system = require('./system')

router.get('/system', system.getSystemInfo)
router.get('/extensions', extensions.listExtensions)
router.get('/extensions/:id/load', extensions.loadExtension)

router.get('/library/find-info', library.findMovieInfo)
router.get('/library', library.listLibrary)
router.get('/library/:id', library.getLibrary)
router.patch('/library/:id', library.updateLibrary)
router.post('/library/scan', library.scanLibrary)
router.get('/library/:id/episodes', library.listEpisodes)
router.get('/episodes/:id', library.getEpisode)
router.get('/episodes/:id/thumbnail', library.getEpisodeThumbnail)
router.patch('/episodes/:id', library.updateEpisode)

router.get('/collections/continue-watching', collections.continueWatching)
router.get('/collections/recently-added', collections.recentlyAdded)

router.get('/watch/:id', streaming.watch)
router.get('/watch/:wid/subtitles', streaming.listSubtitles)
router.get('/subtitles/:id', streaming.getSubtitles)
router.post('/subtitles/:wid/download', streaming.downloadSubtitles)

router.post('/downloads', downloads.addTorrent)
router.get('/downloads', downloads.listTorrents)

module.exports = router
