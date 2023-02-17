const exportsJson = {
  dotenv: require('dotenv'),
  path: require('path'),
  bodyParser: require('koa-bodyparser'),
  cors: require('@koa/cors'),
  moment: require('moment'),
  Koa: require('koa'),
  fs: require('fs'),
  Router: require('@koa/router'),
  logger: require('koa-logger'),
  cron: require('node-cron'),
  axios: require('axios').default,
  Joi: require('joi'),
};

module.exports = {
  ...exportsJson,
  router: new exportsJson.Router(),
  app: new exportsJson.Koa(),
};
