const { moment } = require('../services/imports');
const request = require('../middleware/axios-request');
const config = require('../config');

module.exports = {
  sendReminder: async () => {
    try {
      const sdate = new Date().toISOString();
      // add 1 minute to the current time
      const edate = moment(sdate).add(1, 'minutes').toISOString();
      // const date = '2020-05-15T07:30:00.000Z';
      console.log(sdate, edate);
      const dailyReminderUsersResp = await request.get(
        '',
        `${config.databaseUrl}/common/get-event-reminder-by-date?sdate=${sdate}&edate=${edate}`
      );
      const dailyReminderUsersList = dailyReminderUsersResp.data.result || [];
      if (dailyReminderUsersList.length) {
        const payload = dailyReminderUsersList;
        console.log(payload, 'payload');
        const sendReminders = await request.post(
          '',
          `${config.emailUrl}/email/event-reminder/send-event-reminders`,
          payload
        );
        console.log('\n sendReminders...', sendReminders.data);
      }
      console.log('reminder mail send success...');
      return 'reminder mail send success';
    } catch (error) {
      console.log('reminder mail send error...', error);
      return 'reminder mail send error';
    }
  },
};
