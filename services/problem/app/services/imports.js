const exportsJson = {
  Koa: require('koa'),
  Router: require('@koa/router'),
  dotenv: require('dotenv'),
  axios: require('axios').default,
  bodyParser: require('koa-bodyparser'),
  cors: require('@koa/cors'),
  Joi: require('joi'),
  jwt: require('jsonwebtoken'),
  moment: require('moment'),
  fs: require('fs'),
  logger: require('koa-logger'),
};

module.exports = {
  ...exportsJson,
  router: new exportsJson.Router(),
  app: new exportsJson.Koa(),
};
