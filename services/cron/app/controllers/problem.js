const request = require('../middleware/axios-request');
const config = require('../config');

module.exports = {
  syncFhir: async () => {
    try {
      const trackerRecords = await request.get('', `${config.databaseUrl}/job/problem/get-list`);
      const trackerList = trackerRecords.data.result || { problem: [], records: [] };
      if (trackerList.problem.length || trackerList.records.length) {
        const problemFhirUpdateResp = await request.post('', `${config.problemUrl}/problem/fhir`, { trackerList });
        console.log('\n problemFhirUpdateResp...', problemFhirUpdateResp.data);
        if (problemFhirUpdateResp.data.result.fhirSyncArray) {
          const syncResp = await request.post('', `${config.databaseUrl}/job/problem/sync-fhir`, {
            fhirSyncArray: problemFhirUpdateResp.data.result.fhirSyncArray,
          });
          console.log('\n syncResp...', syncResp.data);
        }
      }
      console.log('\n problem fhir sync success...');
      return 'problem fhir sync success';
    } catch (error) {
      console.log('\n problem fhir sync error...', error);
      return 'problem fhir sync error';
    }
  },
};
