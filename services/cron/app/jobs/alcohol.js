const { cron } = require('../services/imports');
const alcohol = require('../controllers/alcohol');
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

cron.schedule(config.alcoholFhirSyncSchedule, () => {
  alcohol.syncFhir();
});

module.exports = cron;
