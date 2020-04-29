const { colors } = require('tailwindcss/defaultTheme')

module.exports = {
  theme: {
    extend: {
      colors: {
        primary: colors.teal[700],
        success: colors.green[600],
        error: colors.red[600]
      }
    },
    aspectRatio: {
      none: 0,
      square: [ 1, 1 ],
      '16/9': [ 16, 9 ],
      '2/3': [ 2, 3 ], // for movie posters
      '4/3': [ 4, 3 ],
      '21/9': [ 21, 9 ]
    }
  },
  variants: {
    aspectRatio: [ 'responsive' ],
    borderColor: [ 'hover', 'focus', 'disabled' ],
    cursor: [ 'disabled' ],
    textColor: [ 'hover', 'focus', 'disabled' ]
  },
  plugins: [
    require('tailwindcss-aspect-ratio')
  ]
}
