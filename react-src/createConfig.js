const createConfig = require('../createConfig')


export default function createReactConfig (...configs) {
  return createConfig(
    {mode: process.env.NODE_ENV || 'development'},
    ...configs
  )
}
