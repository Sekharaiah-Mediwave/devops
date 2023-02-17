const { cron } = require('../services/imports');
const temperature = require('../controllers/temperature');
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

cron.schedule(config.temperatureFhirSyncSchedule, () => {
  temperature.syncFhir();
});

module.exports = cron;
