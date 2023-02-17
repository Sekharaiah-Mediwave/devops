const { cron } = require('../services/imports');
const smoke = require('../controllers/smoke');
const config = require('../config');

/*
 # ┌────────────── second (optional)
 # │ ┌──────────── minute
 # │ │ ┌────────── hour
 # │ │ │ ┌──────── day of month
 # │ │ │ │ ┌────── month
 # │ │ │ │ │ ┌──── day of week
 # │ │ │ │ │ │
 # │ │ │ │ │ │
 # * * * * * *
 */

cron.schedule(config.smokeFhirSyncSchedule, async () => {
  await smoke.syncSmokeFhir();
  await smoke.syncSmokeTimelineFhir();
});

cron.schedule(config.smokeReminderSchedule, async () => {
  await smoke.sendSmokeReminder();
});

module.exports = cron;
