const exportsJson = {
  Koa: require('koa'),
  Router: require('@koa/router'),
  dotenv: require('dotenv'),
  axios: require('axios').default,
  bodyParser: require('koa-bodyparser'),
  cors: require('@koa/cors'),
  jwt: require('jsonwebtoken'),
  asyncRedis: require('async-redis'),
  fs: require('fs'),
  logger: require('koa-logger'),
};

module.exports = {
  ...exportsJson,
  app: new exportsJson.Koa(),
};
