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
  databaseUrl: checkEndStringAndRemove(process.env.DATABASE_URL, '/'),
  fhirServerUrl: process.env.FHIR_SERVER,
  fhirTagUrl: process.env.FHIR_TAG_URL,
  fhirTagCode: process.env.FHIR_TAG_CODE,
  amqp_url: checkEndStringAndRemove(process.env.AMQP_URL, '/'),
  notificationChannel: 'notify-queue',
};

module.exports = { ...envConfigs };
