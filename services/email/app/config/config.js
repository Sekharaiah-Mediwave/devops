/* eslint-disable no-undef */
function checkEndStringAndRemove(stringToCheck = '', endStringToValidate = '') {
  if (stringToCheck.endsWith(endStringToValidate)) {
    return stringToCheck.slice(0, stringToCheck.length - endStringToValidate.length);
  }
  return stringToCheck;
}
const envConfigs = {
  port: process.env.PORT,
  host: process.env.HOST,
  sendGridApiKey: process.env.SENDGRID_API_KEY,
  fromMailId: process.env.FROM_MAIL_ID,
  databaseUrl: checkEndStringAndRemove(process.env.DATABASE_URL, '/'),
  frontEndUrl: checkEndStringAndRemove(process.env.FRONT_END_DOMAIN_URL, '/'),
};

module.exports = { ...envConfigs };
