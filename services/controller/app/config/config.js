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
  jwtSecret: process.env.JWTSECRET,
  redis_options: {
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
  },
  roleNames: {
    ma: 'MAdmin',
    a: 'Admin',
    cl: 'Clinician',
    ct: 'Care Team',
    t: 'Teacher',
    sa: 'Super Admin',
    p: 'Patient',
  },
  cronUrl: checkEndStringAndRemove(process.env.CRON_URL, '/'),
  databaseUrl: checkEndStringAndRemove(process.env.DATABASE_URL, '/'),
  authUrl: checkEndStringAndRemove(process.env.AUTH_URL, '/'),
  emailUrl: checkEndStringAndRemove(process.env.EMAIL_URL, '/'),
  userUrl: checkEndStringAndRemove(process.env.USER_URL, '/'),
  redisUrl: checkEndStringAndRemove(process.env.CACHE_URL, '/'),
  alcoholUrl: checkEndStringAndRemove(process.env.ALCOHOL_URL, '/'),
  painUrl: checkEndStringAndRemove(process.env.PAIN_URL, '/'),
  sleepUrl: checkEndStringAndRemove(process.env.SLEEP_URL, '/'),
  smokeUrl: checkEndStringAndRemove(process.env.SMOKE_URL, '/'),
  moodUrl: checkEndStringAndRemove(process.env.MOOD_URL, '/'),
  problemUrl: checkEndStringAndRemove(process.env.PROBLEM_URL, '/'),
  bmiUrl: checkEndStringAndRemove(process.env.BMI_URL, '/'),
  bloodUrl: checkEndStringAndRemove(process.env.BLOOD_URL, '/'),
  temperatureUrl: checkEndStringAndRemove(process.env.TEMPERATURE_URL, '/'),
  copingUrl: checkEndStringAndRemove(process.env.COPING_URL, '/'),
  diaryUrl: checkEndStringAndRemove(process.env.DIARY_URL, '/'),
  goalUrl: checkEndStringAndRemove(process.env.GOAL_URL, '/'),
  healthUrl: checkEndStringAndRemove(process.env.HEALTH_URL, '/'),
  circleUrl: checkEndStringAndRemove(process.env.CIRCLE_URL, '/'),
  appSettingsUrl: checkEndStringAndRemove(process.env.APP_SETTINGS_URL, '/'),
  uploadUrl: checkEndStringAndRemove(process.env.UPLOAD_URL, '/'),
  resourceUrl: checkEndStringAndRemove(process.env.RESOURCE_URL, '/'),
  notificationUrl: checkEndStringAndRemove(process.env.NOTIFICATION_URL, '/'),
  fitbitUrl: checkEndStringAndRemove(process.env.FITBIT_URL, '/'),
  appointmentUrl: checkEndStringAndRemove(process.env.APPOINTMENT_URL, '/'),
};

module.exports = { ...envConfigs };
