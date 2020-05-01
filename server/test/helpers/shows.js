module.exports = [
  {
    path: 'Romanzo.Criminale.S02E03.iTALiAN.HDTV.XviD-SiD.avi',
    // expected: { imdbId: 'tt1738643', season: 2, episode: 3, movie: { imdbId: 'tt1242773' } }
    expected: { season: 2, episode: 3, movie: { imdbId: 'tt1242773' } }
  },
  {
    path: 'Star.Wars.Episode.4.A.New.Hope.1977.1080p.BrRip.x264.BOKUTOX.YIFY.mp4',
    expected: { type: 'movie', imdbId: 'tt0076759' }
  },
  {
    path: 'Star.Wars.Episode.5.The.Empire.Strikes.Back.1980.1080p.BrRip.x264.BOKUTOX.YIFY.mp4',
    expected: { type: 'movie', imdbId: 'tt0080684' }
  },
  {
    path: 'Star.Wars.Episode.6.Return.of.the.Jedi.1983.1080p.BrRip.x264.BOKUTOX.YIFY.mp4',
    expected: { type: 'movie', imdbId: 'tt0086190' }
  },
  {
    path: '(1960) La Dolce Vita - CD1.avi',
    expected: { imdbId: 'tt0053779', part: 1, year: 1960 }
  },
  {
    path: 'Non è un paese per vecchi - CD 2.avi',
    expected: { imdbId: 'tt0477348', part: 2 }
  },
  {
    path: 'The.Handmaids.Tale.S01E03.720p.WEBRip.x264-MOROSE[eztv].mkv',
    expected: { imdbId: 'tt5931652', title: 'Late', season: 1, episode: 3, movie: { imdbId: 'tt5834204' } }
  }
]
