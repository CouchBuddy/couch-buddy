module.exports = {
  theme: {
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
    aspectRatio: [ 'responsive' ]
  },
  plugins: [
    require('tailwindcss-aspect-ratio')
  ]
}
