const exportsJson = {
  dotenv: require('dotenv'),
  path: require('path'),
  bodyParser: require('koa-bodyparser'),
  cors: require('@koa/cors'),
  moment: require('moment'),
  asyncRedis: require('async-redis'),
  Koa: require('koa'),
  fs: require('fs'),
  Router: require('@koa/router'),
  logger: require('koa-logger'),
};

module.exports = {
  ...exportsJson,
  router: new exportsJson.Router(),
  app: new exportsJson.Koa(),
};
