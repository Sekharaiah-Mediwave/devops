const request = require('../middleware/axios-request');
const config = require('../config');

module.exports = {
  syncFhir: async () => {
    try {
      const trackerRecords = await request.get('', `${config.databaseUrl}/job/diary/get-list`);
      const trackerList = trackerRecords.data.result || [];
      if (trackerList.length) {
        const diaryFhirUpdateResp = await request.post('', `${config.diaryUrl}/diary/fhir`, { trackerList });
        console.log('\n diaryFhirUpdateResp...', diaryFhirUpdateResp.data);
        if (diaryFhirUpdateResp.data.result) {
          await request.post('', `${config.databaseUrl}/job/diary/sync-fhir`, {
            fhirSyncArray: diaryFhirUpdateResp.data.result,
          });
        }
      }
      console.log('\n diary fhir sync success...');
      return 'diary fhir sync success';
    } catch (error) {
      console.log('\n diary fhir sync error...', error);
      return 'diary fhir sync error';
    }
  },
};
