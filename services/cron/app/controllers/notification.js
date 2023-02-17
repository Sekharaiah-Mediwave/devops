const { moment } = require('../services/imports');
const request = require('../middleware/axios-request');
const config = require('../config');

module.exports = {
  sendReminder: async () => {
    try {
      const edate = new Date().toISOString();
      // add 1 minute to the current time
      const sdate = moment(edate).add(1, 'minutes').toISOString();
      // const date = '2020-05-15T07:30:00.000Z';
      console.log(edate);
      const notiData = await request.get('', `${config.databaseUrl}/notification/getAllNotification?toDate=${sdate}`);
      const notificationData = notiData.data.result || [];
      console.log(notificationData, 'notificationData');
      const data = [];
      if (notificationData.length) {
        notificationData.map((item) => {
          item.notification_schedule.send_to.map((i) => {
            data.push({
              emails: i.email,
              firstName: i.firstName,
              lastName: i.lastName,
              subject: item.notification_schedule.subject,
              message: item.notification_schedule.message,
            });
          });
        });
        const sendReminders = await request.post('', `${config.emailUrl}/email/notification/send-notifications`, data);
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
