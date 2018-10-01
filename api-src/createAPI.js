import express from 'express'


function createRoutes (app, method, routes) {
  for (let path in routes) {
    const route = routes[path]
    
    if (Array.isArray(route)) {
      app[method](path, ...route)
    }
    else {
      app[method](path, route)
    }
  }
}

export default ({
  GET,
  POST,
  PUT,
  DELETE,
  OPTIONS,
  middleware
}) => () => {
  // initializes express
  const app = express()
  // disables x-powered-by: express header
  app.disable('x-powered-by')
  // applies user-defined middleware
  app.use(...middleware)
  // server test handler
  app.get('/ping/:pong', (req, res, next) => res.json({pong: req.params.pong}))
  // attaches defined GET routes
  GET && createRoutes(app, 'get', GET)
  // attaches defined POST routes
  POST && createRoutes(app, 'post', POST)
  // attaches defined PUT routes
  PUT && createRoutes(app, 'put', PUT)
  // attaches defined DELETE routes
  DELETE && createRoutes(app, 'delete', DELETE)
  // attaches defined OPTIONS routes
  OPTIONS && createRoutes(app, 'options', OPTIONS)
  // has to return the app for Webpack dev server
  return app
}
