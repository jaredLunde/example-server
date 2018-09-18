import express from 'express'
import emptyArr from 'empty/array'


export function getFiles (stats) {
  let files = []

  for (let chunk of stats.chunks) {
    if (chunk.entry) {
      files = [...chunk.files, ...files]
    }
    else {
      files = [...files, ...chunk.files]
    }
  }

  return files
}

export function getScripts (stats) {
  return getFiles(stats).map(
    (s, i) => `<script
      type='text/javascript'
      src='${stats.publicPath}${s}'
      ${i === 0 ? 'async' : 'defer'}
    ></script>`
  ).join('')
}

export default function createRenderer({
  // express middleware to apply to each request
  middleware = emptyArr,
  render
}) {
  return function (compilation) {
    // initializes express
    const app = express()
    // applies any user-defined middleware
    middleware.forEach(mw => app.use(mw))
    // renders the app
    app.get('*', render(compilation))
    return app
  }
}
