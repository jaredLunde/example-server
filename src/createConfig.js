import path from 'path'
import webpack from 'webpack'
import merge from 'webpack-merge'
import WriteFilePlugin from 'write-file-webpack-plugin'


module.exports = function createConfig (...configs) {
  let {
    target = 'web',
    ...config
  } = merge.smartStrategy({'module.rules': 'prepend'})(...configs)

  const envTarget =
    target === 'node'
      ? {"node": "current"}
      : {"browsers": "defaults"}

  const mainFields =
    target === 'web'
      ? ['browser', 'module', 'jsnext', 'esnext', 'jsnext:main', 'main']
      : ['module', 'jsnext', 'esnext', 'jsnext:main', 'main']

  return merge.smartStrategy({'module.rules': 'prepend'})(
    {
      devtool: process.env.NODE_ENV !== 'production' ? 'eval' : false,
      target,

      // The base directory for resolving the entry option
      output: {
        publicPath: '/public/',
        pathinfo: true
      },

      // Where to resolve our loaders
      resolveLoader: {
        modules: ['node_modules'],
        moduleExtensions: ['-loader'],
      },

      resolve: {
        // Directories that contain our modules
        symlinks: false,
        modules: ['node_modules'],
        mainFields,
        descriptionFiles: ['package.json'],
        // Extensions used to resolve modules
        extensions: ['.mjs', '.js', '.jsx'],
      },

      module: {
        rules: [
          {
            test: /(\.js|\.jsx)$/,
            use: {
              loader: 'babel',
              options: {
                cacheDirectory: false,
                presets: [
                  [
                    '@inst-app/esx', {
                      env: {
                        "useBuiltIns": "usage",
                        "modules": false,
                        "targets": envTarget
                      },
                      "runtime": {corejs: 2}
                    }
                  ],
                  '@inst-app/react'
                ],
                comments: process.env.NODE_ENV === 'development'
              }
            },
            exclude: /node_modules/
          }
        ]
      },

      plugins: [new WriteFilePlugin()],

      // Include mocks for when node.js specific modules may be required
      node: {
        fs: 'empty',
        vm: 'empty',
        net: 'empty',
        tls: 'empty'
      }
    },
    config
  )
}
