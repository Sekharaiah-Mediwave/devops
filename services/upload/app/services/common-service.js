const { momentTz } = require('./imports');

const indiaTz = (date) => {
  if (!date) {
    return momentTz().tz('Asia/Kolkata');
  }
  return momentTz(momentTz(date).toDate()).tz('Asia/Kolkata');
};
module.exports = {
  indiaTz,
  setHeaders: (headersData, headerKeys = []) => {
    if (headersData) {
      let returnHeaders = {};
      if (headerKeys.length) {
        headerKeys.forEach((headerKeyName) => {
          returnHeaders = { ...returnHeaders, [headerKeyName]: headersData[headerKeyName] };
        });
        headersData = returnHeaders;
      }
      return {
        headers: headersData
      };
    }
    return undefined;
  },
};
