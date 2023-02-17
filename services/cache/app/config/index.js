/* eslint-disable no-undef */
module.exports = {
  redis_options: {
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
  },
  port: process.env.PORT,
  host: process.env.HOST,
};
