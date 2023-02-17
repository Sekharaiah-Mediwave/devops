const exportsJson = {
  Koa: require('koa'),
  Router: require('@koa/router'),
  dotenv: require('dotenv'),
  axios: require('axios').default,
  bodyParser: require('koa-bodyparser'),
  cors: require('@koa/cors'),
  Joi: require('joi'),
  fs: require('fs'),
  moment: require('moment'),
  logger: require('koa-logger'),
  _: require('lodash'),
};

module.exports = {
  ...exportsJson,
  router: new exportsJson.Router(),
  app: new exportsJson.Koa(),
};
