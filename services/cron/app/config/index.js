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
  alcoholFhirSyncSchedule: process.env.ALCOHOL_FHIR_SYNC_SCHEDULE || '0 0 0 * * *',
  sleepFhirSyncSchedule: process.env.SLEEP_FHIR_SYNC_SCHEDULE || '0 0 0 * * *',
  painFhirSyncSchedule: process.env.PAIN_FHIR_SYNC_SCHEDULE || '0 0 0 * * *',
  problemFhirSyncSchedule: process.env.PROBLEM_FHIR_SYNC_SCHEDULE || '0 0 0 * * *',
  moodFhirSyncSchedule: process.env.MOOD_FHIR_SYNC_SCHEDULE || '0 0 0 * * *',
  temperatureFhirSyncSchedule: process.env.TEMPERATURE_FHIR_SYNC_SCHEDULE || '0 0 0 * * *',
  bmiFhirSyncSchedule: process.env.BMI_FHIR_SYNC_SCHEDULE || '0 0 0 * * *',
  bloodFhirSyncSchedule: process.env.BLOOD_FHIR_SYNC_SCHEDULE || '0 0 0 * * *',
  smokeFhirSyncSchedule: process.env.SMOKE_FHIR_SYNC_SCHEDULE || '0 0 0 * * *',
  diaryFhirSyncSchedule: process.env.DIARY_FHIR_SYNC_SCHEDULE || '0 0 0 * * *',
  copingFhirSyncSchedule: process.env.COPING_FHIR_SYNC_SCHEDULE || '0 0 0 * * *',
  appointmentStatusChangeSchedule: process.env.APPOINTMENT_STATUS_CHANGE || '0 0 0 * * *',
  accountContactFhirSyncSchedule: process.env.ACCOUNT_CONTACT_FHIR_SYNC_SCHEDULE || '0 0 0 * * *',
  accountHealthFhirSyncSchedule: process.env.ACCOUNT_HEALTH_FHIR_SYNC_SCHEDULE || '0 0 0 * * *',
  accountPersonalFhirSyncSchedule: process.env.ACCOUNT_PERSONAL_FHIR_SYNC_SCHEDULE || '0 0 0 * * *',
  tableCronSyncSchedule: process.env.TABLE_CRON_SYNC_SCHEDULE || '0 0 0 * * *',
  smokeReminderSchedule: process.env.SMOKE_REMINDER_SCHEDULE || '0 0 0 * * *',
  goalCronSyncSchedule: process.env.GOAL_REMINDER_SCHEDULE || '*/1 * * * *',
  goalCronCompletedSchedule: process.env.GOAL_COMPLETED_SCHEDULE || '*/1 * * * *',
  eventReminderSchedule: process.env.EVENT_REMINDER_SCHEDULE || '*/1 * * * *',
  notificationSchedule: process.env.NOTIFICATION_SCHEDULE || '*/1 * * * *',
  databaseUrl: checkEndStringAndRemove(process.env.DATABASE_URL, '/'),
  userUrl: checkEndStringAndRemove(process.env.USER_URL, '/'),
  alcoholUrl: checkEndStringAndRemove(process.env.ALCOHOL_URL, '/'),
  painUrl: checkEndStringAndRemove(process.env.PAIN_URL, '/'),
  problemUrl: checkEndStringAndRemove(process.env.PROBLEM_URL, '/'),
  moodUrl: checkEndStringAndRemove(process.env.MOOD_URL, '/'),
  sleepUrl: checkEndStringAndRemove(process.env.SLEEP_URL, '/'),
  smokeUrl: checkEndStringAndRemove(process.env.SMOKE_URL, '/'),
  bmiUrl: checkEndStringAndRemove(process.env.BMI_URL, '/'),
  copingUrl: checkEndStringAndRemove(process.env.COPING_URL, '/'),
  temperatureUrl: checkEndStringAndRemove(process.env.TEMPERATURE_URL, '/'),
  bloodUrl: checkEndStringAndRemove(process.env.BLOOD_URL, '/'),
  diaryUrl: checkEndStringAndRemove(process.env.DIARY_URL, '/'),
  emailUrl: checkEndStringAndRemove(process.env.EMAIL_URL, '/'),
  goalUrl: checkEndStringAndRemove(process.env.GOAL_URL, '/'),
};

module.exports = { ...envConfigs };
