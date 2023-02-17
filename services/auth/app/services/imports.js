const exportsJson = {
  Koa: require('koa'),
  Router: require('@koa/router'),
  dotenv: require('dotenv'),
  axios: require('axios').default,
  bodyParser: require('koa-bodyparser'),
  cors: require('@koa/cors'),
  Joi: require('joi'),
  googleapi: require('googleapis'),
  jwt: require('jsonwebtoken'),
  jwksClient: require('jwks-rsa'),
  querystring: require('query-string'),
  fs: require('fs'),
  logger: require('koa-logger'),
};

const { v4: uuidv4 } = require('uuid');

module.exports = {
  ...exportsJson,
  router: new exportsJson.Router(),
  app: new exportsJson.Koa(),
  uuidv4,
};
