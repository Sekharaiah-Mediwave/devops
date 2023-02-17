const exportsJson = {
  Koa: require('koa'),
  Router: require('@koa/router'),
  dotenv: require('dotenv'),
  axios: require('axios').default,
  bodyParser: require('koa-bodyparser'),
  cors: require('@koa/cors'),
  Joi: require('joi'),
  moment: require('moment'),
  fs: require('fs'),
  momentTz: require('moment-timezone'),
  logger: require('koa-logger'),
  amqp: require('amqplib/callback_api'),
};

const { v4: uuidv4 } = require('uuid');

module.exports = {
  ...exportsJson,
  router: new exportsJson.Router(),
  app: new exportsJson.Koa(),
  uuidv4,
};
