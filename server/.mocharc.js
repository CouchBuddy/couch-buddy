module.exports = {
  ignore: [
    './test/helpers/**/*',
    './test/mocha.env.js'
  ],
  require: [
    'ts-node/register',
    'test/mocha.env'
  ],
  extension: [
    'ts'
  ]
}
