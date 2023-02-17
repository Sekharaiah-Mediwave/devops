const request = require('../middleware/axios-request');
const config = require('../config');

module.exports = {
  syncFhir: async () => {
    try {
      const trackerRecords = await request.get('', `${config.databaseUrl}/job/mood/get-list`);
      const trackerList = trackerRecords.data.result || [];
      if (trackerList.length) {
        const moodFhirUpdateResp = await request.post('', `${config.moodUrl}/mood/fhir`, { trackerList });
        console.log('\n moodFhirUpdateResp...', moodFhirUpdateResp.data);
        if (moodFhirUpdateResp.data.result) {
          await request.post('', `${config.databaseUrl}/job/mood/sync-fhir`, {
            fhirSyncArray: moodFhirUpdateResp.data.result,
          });
        }
      }
      console.log('\n mood fhir sync success...');
      return 'mood fhir sync success';
    } catch (error) {
      console.log('\n mood fhir sync error...', error);
      return 'mood fhir sync error';
    }
  },
};
