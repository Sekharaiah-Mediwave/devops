const { cron } = require('../services/imports');
const account = require('../controllers/account');
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

cron.schedule(config.accountContactFhirSyncSchedule, () => {
  account.syncFhir('contact');
});

cron.schedule(config.accountHealthFhirSyncSchedule, () => {
  account.syncFhir('health');
});

cron.schedule(config.accountPersonalFhirSyncSchedule, () => {
  account.syncFhir('personal');
});

module.exports = cron;
