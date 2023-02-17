const exportsJson = {
    Koa: require('koa'),
    Router: require('@koa/router'),
    dotenv: require('dotenv'),
    axios: require('axios').default,
    bodyParser: require('koa-bodyparser'),
    cors: require('@koa/cors'),
    path: require('path'),
    multer: require('multer'),
    fs: require('fs'),
    moment: require('moment'),
    momentTz: require('moment-timezone'),
    _: require('lodash'),
    bcrypt: require('bcryptjs'),
    jwt: require('jsonwebtoken'),
    http: require('http'),
    Sequelize: require('sequelize'),
    randomstring: require('randomstring'),
    logger: require('koa-logger'),
    crypto: require("crypto"),
    pkceChallenge: require("pkce-challenge").default,
    amqp: require('amqplib/callback_api'),
};

const { v4: uuidv4 } = require('uuid');

module.exports = {
  ...exportsJson,
  app: new exportsJson.Koa(),
  uuidv4,
};
