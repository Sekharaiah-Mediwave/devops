const request = require('../middleware/axios-request');
const config = require('../config');

module.exports = {
  syncFhir: async () => {
    try {
      const trackerRecords = await request.get('', `${config.databaseUrl}/job/pain/get-list`);
      const trackerList = trackerRecords.data.result || [];
      if (trackerList.length) {
        const painFhirUpdateResp = await request.post('', `${config.painUrl}/pain/fhir`, { trackerList });
        console.log('\n painFhirUpdateResp...', painFhirUpdateResp.data);
        if (painFhirUpdateResp.data.result) {
          await request.post('', `${config.databaseUrl}/job/pain/sync-fhir`, {
            fhirSyncArray: painFhirUpdateResp.data.result,
          });
        }
      }
      console.log('\n pain fhir sync success...');
      return 'pain fhir sync success';
    } catch (error) {
      console.log('\n pain fhir sync error...', error);
      return 'pain fhir sync error';
    }
  },
};
