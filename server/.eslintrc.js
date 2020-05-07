module.exports = {
  env: {
    mocha: true
  },
  extends: [
    "plugin:@typescript-eslint/recommended"
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
    "quotes": [ "error", "single" ],
    "semi": [ "error", "never" ],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": 1,
    "@typescript-eslint/no-inferrable-types": [
      "warn", {
        "ignoreParameters": true
      }
    ],
    "@typescript-eslint/no-unused-vars": "warn"
  }
}
