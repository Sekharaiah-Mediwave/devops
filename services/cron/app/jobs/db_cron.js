const { cron } = require('../services/imports');
const cronController = require('../controllers/cron');
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

const cronJobsJson = {};

const checkFirstStringAndAppend = (stringToCheck = '', startStringToValidate = '') => {
  if (stringToCheck.startsWith(startStringToValidate)) {
    return stringToCheck;
  }
  return `${startStringToValidate}${stringToCheck}`;
};

const syncStartCrons = async () => {
  const cronsScheduleLists = await cronController.getAllLists();
  if (cronsScheduleLists && cronsScheduleLists.length) {
    cronsScheduleLists.forEach((cronData) => {
      cronJobsJson[cronData.uuid] = cron.schedule(cronData.cronScheduleTime, () => {
        try {
          cronController.doHitCron(
            config.databaseUrl + checkFirstStringAndAppend('/', cronData.mailApiRoute),
            cronData.cronInitialValues
          );
        } catch (error) {
          console.log('\n table data cron error...', error);
        }
      });
      cronJobsJson[cronData.uuid].start();
    });
    console.log('\n cronJobsJson...', cronJobsJson);
  }
};

cron.schedule(config.tableCronSyncSchedule, () => {
  try {
    for (const key in cronJobsJson) {
      if (cronJobsJson[key]) {
        cronJobsJson[key].stop();
        delete cronJobsJson[key];
      }
    }
    if (Object.keys(cronJobsJson).length === 0) {
      syncStartCrons();
    }
  } catch (error) {
    console.log('\n table cron sync error...', error);
  }
});

module.exports = cron;
