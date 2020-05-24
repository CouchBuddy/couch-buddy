import KoaRouter from '@koa/router'

import * as downloads from './downloads'
import * as explore from './explore'
import * as extensions from './extensions'
import * as library from './library'
import * as collections from './media-collections'
import * as streaming from './streaming'
import * as subtitles from './subtitles'
import * as system from './system'

const router = new KoaRouter()

router.get('/system', system.getSystemInfo)

router.get('/extensions', extensions.listExtensions)
router.post('/extensions', extensions.install)

router.get('/library/find-info', library.findMovieInfo)
router.get('/library', library.listLibrary)
router.get('/library/:id', library.getLibrary)
router.patch('/library/:id', library.updateLibrary)
router.get('/library/:id/episodes', library.listEpisodes)
router.get('/episodes/:id', library.getEpisode)
router.get('/episodes/:id/thumbnail', library.getEpisodeThumbnail)
router.patch('/episodes/:id', library.updateEpisode)
router.post('/library/scan', library.scanLibrary)
router.get('/search', library.search)

router.get('/collections/continue-watching', collections.continueWatching)
router.get('/collections/recently-added', collections.recentlyAdded)

router.get('/watch/:id', streaming.watch)
router.get('/watch/:id/metadata', streaming.getMetadata)

router.get('/watch/:wid/subtitles', subtitles.listSubtitles)
router.get('/subtitles/:id', subtitles.getSubtitles)
router.post('/subtitles/:wid/download', subtitles.downloadSubtitles)

router.post('/downloads', downloads.addTorrent)
router.get('/downloads', downloads.listTorrents)
router.post('/downloads/:hash/resumepause', downloads.resumeOrPauseTorrent)
router.delete('/downloads/:hash', downloads.removeTorrent)

router.get('/explore', explore.searchMovies)

export default router
