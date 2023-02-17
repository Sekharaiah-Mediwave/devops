const { moment } = require('../services/imports');
const request = require('../middleware/axios-request');
const config = require('../config');

module.exports = {
  sendGoalCompletedMail: async () => {
    try {
      const date = new Date().toISOString();
      // const date = '2020-05-15T07:30:00.000Z';
      console.log(':: fetching goal reminders for ', date);

      const goalRecords = await request.get('', `${config.databaseUrl}/job/goal/ending-at-date?date=${date}`);
      const trackerList = goalRecords.data.result || [];
      if (trackerList.length) {
        const payload = trackerList;

        const goalFhirUpdateResp = await request.post(
          '',
          `${config.emailUrl}/email/goal/send-rgoal-completed-bulk`,
          payload
        );
        console.log('\n goalFhirUpdateResp...', goalFhirUpdateResp.data);
      }
      console.log('\n goal timeline fhir sync success...');
      return 'goal timeline fhir sync success';
    } catch (error) {
      console.log('\n goal timeline fhir sync error...', error);
      return 'goal timeline fhir sync error';
    }
  },
  sendGoalReminder: async () => {
    try {
      const date = new Date().toISOString();
      // const date = '2020-05-15T07:30:00.000Z';
      console.log(':: fetching goal reminders for ', date);

      const dailyReminderUsersResp = await request.get(
        '',
        `${config.databaseUrl}/job/goal/get-reminder-list?date=${date}`
      );
      const dailyReminderUsersList = dailyReminderUsersResp.data.result || [];
      if (dailyReminderUsersList.length) {
        const payload = dailyReminderUsersList;

        const sendGoalReminders = await request.post('', `${config.emailUrl}/email/goal/send-rgoal-reminders`, payload);
        console.log('\n sendGoalReminders...', sendGoalReminders.data);

        // now update the status of the entries
        const entry_ids = payload.map((p) => p.entry_id);
        // console.log('entry ids:: ', entry_ids);

        const goalReminderUpdate = await request.put('', `${config.databaseUrl}/goal/update-rgoal-reminders`, {
          ids: entry_ids,
        });
        console.log('\n goalReminderUpdate...', goalReminderUpdate.data);
      }
      console.log('\n goal timeline daily reminder mail send success...');
      return 'goal timeline daily reminder mail send success';
    } catch (error) {
      console.log('\n goal timeline daily reminder mail send error...', error);
      return 'goal timeline daily reminder mail send error';
    }
  },
};
