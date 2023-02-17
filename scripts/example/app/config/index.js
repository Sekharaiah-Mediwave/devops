const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const env = process.env.NODE_ENV;
const configs = {
  base: {
    env,
    database_url: process.env.DATABASE_URL,
    name: 'service-accounts',
    host: '0.0.0.0',
    port: process.env.APP_PORT,
    email_servicve_url: process.env.EMAIL_SERVICE,
    reCAPTCHA_SecretKey: process.env.CAPTCHA_SECRET_KEY,
  },
};
const config = Object.assign(configs.base, configs[env]);

module.exports = config;
