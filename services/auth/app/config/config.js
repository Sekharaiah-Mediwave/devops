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
  nhsClientId: process.env.NHS_LOGIN_CLIENT_ID,
  nhsAudience: process.env.NHS_LOGIN_AUDIENCE,
  nhsPrivateKeyPath: process.env.NHS_LOGIN_PRIVATE_KEY_PATH,
  nhsLoginRedirectUrl: process.env.NHS_LOGIN_CLIENT_REDIRECT_URL,
  nhsLoginTokenHost: process.env.NHS_LOGIN_TOKEN_HOST,
  databaseUrl: checkEndStringAndRemove(process.env.DATABASE_URL, '/'),
  fhirServerUrl: process.env.FHIR_SERVER,
  fhirTagUrl: process.env.FHIR_TAG_URL,
  fhirTagCode: process.env.FHIR_TAG_CODE,
  roleNames: {
    ma: 'MAdmin',
    a: 'Admin',
    cl: 'Clinician',
    ct: 'Care Team',
    t: 'Teacher',
    sa: 'Super Admin',
    p: 'Patient',
  },
};

module.exports = { ...envConfigs };
