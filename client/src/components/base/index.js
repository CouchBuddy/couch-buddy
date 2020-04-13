// Globally register all base components for convenience, because they
// will be used very frequently. Components are registered using the
// PascalCased version of their file name.

import Vue from 'vue'

// Components will be registered as <prefix-name />
const PREFIX = 'X'

// https://webpack.js.org/guides/dependency-management/#require-context
const requireComponent = require.context(
  // Look for files in the current directory
  '.',
  // Do not look in subdirectories
  false,
  // Only include .vue files
  /[\w]+\.vue$/
)

requireComponent.keys().forEach((fileName) => {
  const componentConfig = requireComponent(fileName)
  const componentName = fileName
    // Remove the "./" from the beginning
    .replace(/^\.\//, '')
    // Remove the file extension from the end
    .replace(/\.\w+$/, '')

  // Globally register the component
  Vue.component(`${PREFIX}${componentName}`, componentConfig.default)
})
