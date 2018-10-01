import path from 'path'
import chalk from 'chalk'
import express from 'express'
import compression from 'compression'
import noFavicon from 'express-no-favicons'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import webpackHotServerMiddleware from 'webpack-hot-server-middleware'


module.exports = function startServer ({
  clientConfig, // dev webpack client config
  serverConfig, // dev webpack server config
  port = 3000,  // the local port to run the dev server on
  host = '127.0.0.1'
}) {
  const publicPath = clientConfig.output.publicPath

  // creates the app env
  const app = express()

  // creates an express route for the Javascript assets created by Webpack
  app.use(compression())
  app.use(publicPath, express.static(publicPath))

  // prevents favicons from being sent to the renderer
  app.use(noFavicon())

  let isBuilt = false
  // express listener which is run after the compiler is done
  function startListening () {
    if (isBuilt === false) {
      app.listen(
        parseInt(port),
        host,
        () => {
          isBuilt = true
          console.log(chalk.green(`[Example SSR] ${host}:${port}`))
        }
      )
    }
  }

  if (process.env.NODE_ENV === 'production') {
    /* Production ENV */
    app.use(publicPath, express.static(clientConfig.output.path))
    // starts the webpack compilers
    webpack([clientConfig, serverConfig]).run(
      (err, stats) => {
        if (err) {
          console.log('[Error]', err)
        }
        else {
          const  [clientStats, serverStats] = stats.toJson().children
          const serverPath = path.join(
            serverConfig.output.path,
            serverConfig.output.filename
          )
          const serverRenderer = require(serverPath).default
          app.use(serverRenderer({clientStats}))
          startListening()
        }
      }
    )
  }
  else {
    /* Development ENV */
    // boots up the client config with hot middleweare
    clientConfig.entry = ['webpack-hot-middleware/client?noInfo=false'].concat(
      clientConfig.entry
    )

    clientConfig.plugins = [new webpack.HotModuleReplacementPlugin()].concat(
      clientConfig.plugins
    )

    const compiler = webpack([clientConfig, serverConfig])
    const [clientCompiler, serverCompiler] = compiler.compilers

    // additional compiler options
    const options = {
      publicPath,
      compress: true,
      historyApiFallback: true,
      serverSideRender: true,
      noInfo: true
    }

    // attaches dev middleware to the express app
    const instance = webpackDevMiddleware(compiler, options)
    app.use(instance)
    app.use(webpackHotMiddleware(clientCompiler))
    app.use(webpackHotServerMiddleware(compiler, {reload: true, chunkName: 'm'}))

    // taps into the webpack hook to start the express app once it has finished
    // compiling
    instance.waitUntilValid(startListening)
  }
}
