const config = require('../config');
const request = require('../middleware/axios-request');

module.exports = {
  syncFhir: async () => {
    try {
      const trackerRecords = await request.get('', `${config.databaseUrl}/job/blood-pressure/get-list`);
      const trackerList = trackerRecords.data.result || [];
      if (trackerList.length) {
        const bloodFhirUpdateResp = await request.post('', `${config.bloodUrl}/blood-pressure/fhir`, { trackerList });
        console.log('\n bloodFhirUpdateResp...', bloodFhirUpdateResp.data);
        if (bloodFhirUpdateResp.data.result) {
          await request.post('', `${config.databaseUrl}/job/blood-pressure/sync-fhir`, {
            fhirSyncArray: bloodFhirUpdateResp.data.result,
          });
        }
      }
      console.log('\n blood fhir sync success...');
      return 'blood fhir sync success';
    } catch (error) {
      console.log('\n blood fhir sync error...', error);
      return 'blood fhir sync error';
    }
  },
};
