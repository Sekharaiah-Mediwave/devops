const config = require('../config');
const request = require('../middleware/axios-request');

module.exports = {
  syncFhir: async () => {
    try {
      const trackerRecords = await request.get('', `${config.databaseUrl}/job/alcohol/get-list`);
      const trackerList = trackerRecords.data.result || [];
      if (trackerList.length) {
        const alcoholFhirUpdateResp = await request.post('', `${config.alcoholUrl}/alcohol/fhir`, { trackerList });
        console.log('\n alcoholFhirUpdateResp...', alcoholFhirUpdateResp.data);
        if (alcoholFhirUpdateResp.data.result && alcoholFhirUpdateResp.data.result.fhirSyncArray) {
          const syncResp = await request.post('', `${config.databaseUrl}/job/alcohol/sync-fhir`, {
            fhirSyncArray: alcoholFhirUpdateResp.data.result.fhirSyncArray,
          });
          console.log('\n syncResp...', syncResp);
        }
      }
      console.log('\n alcohol fhir sync success...');
      return 'alcohol fhir sync success';
    } catch (error) {
      console.log('\n alcohol fhir sync error...', error);
      return 'alcohol fhir sync error';
    }
  },
};
