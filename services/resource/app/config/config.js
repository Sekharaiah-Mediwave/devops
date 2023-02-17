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
  resourceUrl: process.env.RESOURCE_URL,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
};

module.exports = { ...envConfigs };
