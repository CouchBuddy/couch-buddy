/* eslint-env node, mocha */

import chai from 'chai'
import chaiSubset from 'chai-subset'

import * as library from '../src/services/library'
import shows from './helpers/shows'

chai.use(chaiSubset)
const expect = chai.expect

describe('Library service', function () {
  for (const show of shows) {
    it('should find correct show info for ' + show.path, async function () {
      const showInfo = await library.searchShowInfo(show.path)

      expect(showInfo).to.containSubset(show.expected)
    })
  }
})
