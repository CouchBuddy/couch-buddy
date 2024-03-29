import KoaRouter from '@koa/router'

import * as downloads from './downloads'
import * as explore from './explore'
import * as extensions from './extensions'
import * as libraries from './libraries'
import * as library from './library'
import * as collections from './media-collections'
import * as streaming from './streaming'
import * as subtitles from './subtitles'
import * as system from './system'

const router = new KoaRouter()

router.get('/system', system.getSystemInfo)

router.get('/extensions', extensions.listExtensions)
router.post('/extensions', extensions.install)

router.get('/libraries/:id', libraries.getLibrary)
router.get('/libraries', libraries.listLibraries)
router.post('/libraries', libraries.createLibraries)
router.patch('/libraries/:id', libraries.updateLibrary)
router.post('/libraries/:id/scan', library.scanLibrary)

router.get('/library/find-info', library.findMovieInfo)
router.get('/library', library.listLibrary)
router.get('/library/:id', library.getLibrary)
router.patch('/library/:id', library.updateLibrary)
router.get('/library/:id/episodes', library.listEpisodes)
router.get('/episodes/:id', library.getEpisode)
router.get('/episodes/:id/thumbnail', library.getEpisodeThumbnail)
router.patch('/episodes/:id', library.updateEpisode)
router.get('/search', library.search)

router.get('/collections/continue-watching', collections.continueWatching)
router.get('/collections/recently-added', collections.recentlyAdded)
router.get('/collections/by-genre/:genre', collections.byGenre)

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
