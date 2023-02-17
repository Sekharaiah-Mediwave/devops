const { cron } = require('../services/imports');
const coping = require('../controllers/coping');
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

cron.schedule(config.copingFhirSyncSchedule, () => {
  coping.syncFhir();
});

module.exports = cron;
