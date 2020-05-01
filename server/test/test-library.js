const chai = require('chai')
const chaiSubset = require('chai-subset')
chai.use(chaiSubset)
const expect = chai.expect

const library = require('../services/library')
const shows = require('./helpers/shows')

describe('Library service', function () {
  for (const show of shows) {
    it('should find correct show info for ' + show.path, async function () {
      const showInfo = await library.searchShowInfo(show.path)

      expect(showInfo, showInfo).to.containSubset(show.expected)
    })
  }
})
