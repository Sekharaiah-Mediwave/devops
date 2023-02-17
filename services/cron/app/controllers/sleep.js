const request = require('../middleware/axios-request');
const config = require('../config');

module.exports = {
  syncFhir: async () => {
    try {
      const trackerRecords = await request.get('', `${config.databaseUrl}/job/sleep/get-list`);
      const trackerList = trackerRecords.data.result || [];
      if (trackerList.length) {
        const sleepFhirUpdateResp = await request.post('', `${config.sleepUrl}/sleep/fhir`, { trackerList });
        console.log('\n sleepFhirUpdateResp...', sleepFhirUpdateResp.data);
        if (sleepFhirUpdateResp.data.result.fhirSyncArray) {
          await request.post('', `${config.databaseUrl}/job/sleep/sync-fhir`, {
            fhirSyncArray: sleepFhirUpdateResp.data.result.fhirSyncArray,
          });
        }
      }
      console.log('\n sleep fhir sync success...');
      return 'sleep fhir sync success';
    } catch (error) {
      console.log('\n sleep fhir sync error...', error);
      return 'sleep fhir sync error';
    }
  },
};
