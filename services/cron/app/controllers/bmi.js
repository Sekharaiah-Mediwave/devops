const request = require('../middleware/axios-request');
const config = require('../config');

module.exports = {
  syncFhir: async () => {
    try {
      const trackerRecords = await request.get('', `${config.databaseUrl}/job/bmi/get-list`);
      const trackerList = trackerRecords.data.result || [];
      if (trackerList.length) {
        const bmiFhirUpdateResp = await request.post('', `${config.bmiUrl}/bmi/fhir`, { trackerList });
        console.log('\n bmiFhirUpdateResp...', bmiFhirUpdateResp.data);
        if (bmiFhirUpdateResp.data.result) {
          await request.post('', `${config.databaseUrl}/job/bmi/sync-fhir`, {
            fhirSyncArray: bmiFhirUpdateResp.data.result,
          });
        }
      }
      console.log('\n bmi fhir sync success...');
      return 'bmi fhir sync success';
    } catch (error) {
      console.log('\n bmi fhir sync error...', error);
      return 'bmi fhir sync error';
    }
  },
};
