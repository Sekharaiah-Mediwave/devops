const request = require('../middleware/axios-request');
const config = require('../config');

module.exports = {
  syncFhir: async () => {
    try {
      const trackerRecords = await request.get('', `${config.databaseUrl}/job/coping/get-list`);
      const trackerList = trackerRecords.data.result || [];
      if (trackerList.length) {
        const copingFhirUpdateResp = await request.post('', `${config.copingUrl}/coping/fhir`, { trackerList });
        console.log('\n copingFhirUpdateResp...', copingFhirUpdateResp.data);
        if (copingFhirUpdateResp.data.result.fhirSyncArray) {
          await request.post('', `${config.databaseUrl}/job/coping/sync-fhir`, {
            fhirSyncArray: copingFhirUpdateResp.data.result.fhirSyncArray,
          });
        }
      }
      console.log('\n coping fhir sync success...');
      return 'coping fhir sync success';
    } catch (error) {
      console.log('\n coping fhir sync error...', error);
      return 'coping fhir sync error';
    }
  },
};
