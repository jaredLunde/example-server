const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')
const createConfig = require('../createConfig')


export default function createAPIConfig (...configs) {
  return createConfig(
    {
      name: 'server',
      target: 'node',
      mode: process.env.NODE_ENV || 'development',
      output: {
        filename: 'handler.js',
        libraryTarget: 'commonjs2'
      },
      externals: [nodeExternals(), 'express', 'encoding'],
      plugins: [
        new webpack.optimize.LimitChunkCountPlugin({maxChunks: 1}),
        new webpack.DefinePlugin({
          '__DEV__': JSON.stringify(process.env.NODE_ENV === 'development')
        })
      ]
    },
    ...configs
  )
}
