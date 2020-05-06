module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
    mocha: true
  },
  extends: [
    'standard'
  ],
  ignorePatterns: [ 'node_modules/', 'public/' ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018
  },
  rules: {
    'array-bracket-spacing': [ 2, 'always', {
        objectsInArrays: false,
        arraysInArrays: false
    }]
  }
}
