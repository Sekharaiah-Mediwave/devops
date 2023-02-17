const { cron } = require('../services/imports');
const notification = require('../controllers/notification');
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

cron.schedule(config.notificationSchedule, async () => {
  await notification.sendReminder();
});

module.exports = cron;
