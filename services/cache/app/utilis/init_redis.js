/* eslint-disable no-undef */
const { asyncRedis } = require('../services/imports');
const config = require('../config/index');

const client = asyncRedis.createClient({
  port: config.redis_options.port,
  host: config.redis_options.host,
});

if (config.redis_options.password) {
  client.auth(config.redis_options.password, (err, resp) => {
    if (err) {
      console.log('\nRedis-Auth-err:', err);
    }
    console.log('\n redis auth success...', resp);
  });
}

client.on('connect', () => {
  console.log('client connected to redis');
});

client.on('ready', () => {
  console.log('redis client is ready to use');
});

client.on('error', (err) => {
  console.log('redis error', err.message);
});

client.on('end', () => {
  console.log('redis client disconnected');
});

process.on('SIGINT', () => {
  console.log('process.on SIGINT');
  client.quit();
  process.exit(0);
});

module.exports = client;
