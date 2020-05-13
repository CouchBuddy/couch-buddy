module.exports = {
  env: {
    es6: true,
    node: true
  },
  extends: [
    'standard',
    'plugin:@typescript-eslint/recommended'
  ],
  ignorePatterns: [ 'dist/', 'node_modules/', 'public/' ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  rules: {
    'array-bracket-spacing': [ 2, 'always', {
      objectsInArrays: false,
      arraysInArrays: false
    }],
    'eol-last': [ 'error', 'always' ],
    // note you must disable the base rule as it can report incorrect errors
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': [ 'error' ],
    'quotes': [ 'error', 'single' ],
    'semi': [ 'error', 'never' ],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 1,
    '@typescript-eslint/no-inferrable-types': [
      'warn', {
        'ignoreParameters': true
      }
    ],
    '@typescript-eslint/no-unused-vars': 'warn'
  }
}
