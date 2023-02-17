const { cron } = require('../services/imports');
const goal = require('../controllers/goal');
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

cron.schedule(config.goalCronSyncSchedule, async () => {
  await goal.sendGoalReminder();
});

cron.schedule(config.goalCronCompletedSchedule, async () => {
  await goal.sendGoalCompletedMail();
});

module.exports = cron;
