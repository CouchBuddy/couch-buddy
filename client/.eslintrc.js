module.exports = {
  root: true,
  env: {
    node: true
  },
  globals: {
    cast: 'readonly',
    chrome: 'readonly'
  },
  extends: [
    'plugin:vue/recommended',
    '@vue/standard',
    '@vue/typescript'
  ],
  parserOptions: {
    parser: '@typescript-eslint/parser'
  },
  rules: {
    'no-console': 'error',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'array-bracket-spacing': [ 2, 'always', {
      objectsInArrays: false,
      arraysInArrays: false
    }]
  }
}
