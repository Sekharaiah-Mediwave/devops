const request = require('../middleware/axios-request');
const config = require('../config');

module.exports = {
  syncFhir: async () => {
    try {
      const trackerRecords = await request.get('', `${config.databaseUrl}/job/temperature/get-list`);
      const trackerList = trackerRecords.data.result || [];
      if (trackerList.length) {
        const tempFhirUpdateResp = await request.post('', `${config.temperatureUrl}/temperature/fhir`, { trackerList });
        console.log('\n tempFhirUpdateResp...', tempFhirUpdateResp.data);
        if (tempFhirUpdateResp.data.result.fhirSyncArray) {
          await request.post('', `${config.databaseUrl}/job/temperature/sync-fhir`, {
            fhirSyncArray: tempFhirUpdateResp.data.result.fhirSyncArray,
          });
        }
      }
      console.log('\n temperature fhir sync success...');
      return 'temperature fhir sync success';
    } catch (error) {
      console.log('\n temperature fhir sync error...', error);
      return 'temperature fhir sync error';
    }
  },
};
