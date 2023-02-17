const { moment } = require('../services/imports');
const request = require('../middleware/axios-request');
const config = require('../config');

module.exports = {
  syncSmokeFhir: async () => {
    try {
      const trackerRecords = await request.get('', `${config.databaseUrl}/job/smoke/get-list`);
      const trackerList = trackerRecords.data.result || [];
      if (trackerList.length) {
        const smokeFhirUpdateResp = await request.post('', `${config.smokeUrl}/smoke/fhir`, { trackerList });
        if (smokeFhirUpdateResp.data.result) {
          await request.post('', `${config.databaseUrl}/job/smoke/sync-fhir`, {
            fhirSyncArray: smokeFhirUpdateResp.data.result.fhirSyncArray,
          });
        }
      }
      console.log('\n smoke fhir sync success...');
      return 'smoke fhir sync success';
    } catch (error) {
      console.log('\n smoke fhir sync error...', error);
      return 'smoke fhir sync error';
    }
  },
  syncSmokeTimelineFhir: async () => {
    try {
      const trackerRecords = await request.get('', `${config.databaseUrl}/job/smoke-timeline/get-list`);
      const trackerList = trackerRecords.data.result || [];
      if (trackerList.length) {
        const smokeFhirUpdateResp = await request.post('', `${config.smokeUrl}/smoke-timeline/fhir`, { trackerList });
        console.log('\n smokeFhirUpdateResp...', smokeFhirUpdateResp.data);
        if (smokeFhirUpdateResp.data.result) {
          await request.post('', `${config.databaseUrl}/job/smoke-timeline/sync-fhir`, {
            fhirSyncArray: smokeFhirUpdateResp.data.result,
          });
        }
      }
      console.log('\n smoke timeline fhir sync success...');
      return 'smoke timeline fhir sync success';
    } catch (error) {
      console.log('\n smoke timeline fhir sync error...', error);
      return 'smoke timeline fhir sync error';
    }
  },
  sendSmokeReminder: async () => {
    try {
      const dailyReminderUsersResp = await request.get(
        '',
        `${config.databaseUrl}/smoke-timeline/get-daily-reminder-users`
      );
      const dailyReminderUsersList = dailyReminderUsersResp.data.result || [];
      const mailSendArr = dailyReminderUsersList.map((smokeData) => ({
        name: smokeData.userInfo.firstName,
        email: smokeData.userInfo.email,
        entryStartDate: moment(smokeData.entryStartDate).format('YYYY-MM-DD'),
        timelineDays: moment().diff(moment(smokeData.entryStartDate)),
      }));

      request.post('', `${config.emailUrl}/email/smoke-timeline/send-reminder`, { smokeUserRecords: mailSendArr });
      console.log('\n smoke timeline daily reminder mail send success...');
      return 'smoke timeline daily reminder mail send success';
    } catch (error) {
      console.log('\n smoke timeline daily reminder mail send error...', error);
      return 'smoke timeline daily reminder mail send error';
    }
  },
};
