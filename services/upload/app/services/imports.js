const exportsJson = {
  Koa: require('koa'),
  Router: require('@koa/router'),
  dotenv: require('dotenv'),
  axios: require('axios').default,
  koaBody: require('koa-body'),
  cors: require('@koa/cors'),
  moment: require('moment'),
  path: require('path'),
  fs: require('fs'),
  momentTz: require('moment-timezone'),
  logger: require('koa-logger'),
  azure: require('azure-storage'),
  sharp: require('sharp'),
};

const { v4: uuidv4 } = require('uuid');

module.exports = {
  ...exportsJson,
  router: new exportsJson.Router(),
  app: new exportsJson.Koa(),
  uuidv4,
};
