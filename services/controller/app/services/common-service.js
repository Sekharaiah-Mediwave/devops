const config = require('../config/config');

module.exports = {
  setHeaders: (headersData, headerKeys = []) => {
    if (headersData) {
      let returnHeaders = {};
      if (headerKeys.length) {
        headerKeys.forEach((headerKeyName) => {
          returnHeaders = { ...returnHeaders, [headerKeyName]: headersData[headerKeyName] };
        });
        headersData = returnHeaders;
        headersData.jwtSecret = config.jwtSecret;
      }
      return {
        headers: headersData
      };
    }
    return undefined;
  },
};
