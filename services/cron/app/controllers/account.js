const config = require('../config');
const request = require('../middleware/axios-request');

module.exports = {
  syncFhir: async (profileType) => {
    try {
      const accountRecords = await request.get(
        '',
        `${config.databaseUrl}/job/account/get-list?profileType=${profileType}`
      );
      const accountList = accountRecords.data.result || [];
      if (accountList.length) {
        const accountFhirUpdateResp = await request.post(
          '',
          `${config.userUrl}/account/fhir?profileType=${profileType}`,
          { accountList }
        );
        console.log('\n accountFhirUpdateResp...', accountFhirUpdateResp.data);
        if (accountFhirUpdateResp.data.result.fhirSyncArray) {
          await request.post('', `${config.databaseUrl}/job/account/sync-fhir?profileType=${profileType}`, {
            fhirSyncArray: accountFhirUpdateResp.data.result.fhirSyncArray,
          });
        }
      }
      console.log(`\n ${profileType} fhir sync success...`);
      return `${profileType} fhir sync success`;
    } catch (error) {
      console.log(`\n ${profileType} fhir sync error...`, error);
      return `${profileType} fhir sync error`;
    }
  },
};
