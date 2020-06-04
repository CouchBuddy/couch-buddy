module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/recommended',
    '@vue/standard'
  ],
  parserOptions: {
    parser: 'babel-eslint'
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
