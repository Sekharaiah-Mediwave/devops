const config = require('../config/config');
const request = require('./axios-request');
const { moment } = require('../services/imports');

module.exports = {
  getAuthToken: () => async (ctx, next) => {
    async function createAccesstoken(ctx) {
      try {
        console.log('--in',ctx.request);
        const apiResp = await request.get(
          null,
          `${config.resourceUrl}api/oauth/accesstoken?clientId=${config.clientId}&clientSecret=${config.clientSecret}`
        );

        await request.post(null, `${config.databaseUrl}/common/create-resource-token`, {
          accessToken: apiResp.data.data.accessToken,
          refreshToken: apiResp.data.data.refreshToken,
          expiryDate: apiResp.data.data.validUpto,
        });
        console.log("apiResp.data",apiResp.data);
        ctx.request.accessToken = { Authorization: `Bearer ${apiResp.data.data.accessToken}` };
      } catch (error) {
        console.log('----erorr', error);
      }
    }
    try {
      const apiResp = await request.get(null, `${config.databaseUrl}/common/get-resource-token`);
      if (apiResp.data.result?.expiryDate) {
        const now = moment();
        const expirationDate = moment(apiResp.data.result.expiryDate); // another date
        if (now.isAfter(expirationDate)) {
          try {
            const apiResp1 = await request.get(
              null,
              `${config.resourceUrl}api/oauth/regenerate?refreshToken=${apiResp.data.result.refreshToken}`
            );
            // console.log(`${config.databaseUrl}/common/create-resource-token`,"---");
            await request.post(null, `${config.databaseUrl}/common/create-resource-token`, {
              accessToken: apiResp1.data.data.accessToken,
              refreshToken: apiResp1.data.data.refreshToken,
            });
            ctx.request.accessToken = { Authorization: `Bearer ${apiResp1.data.data.accessToken}` };
          } catch (error) {
            // console.log("error--",error);
            await createAccesstoken(ctx);
          }
        } else {
        console.log('--in',apiResp.data.result.accessToken);
          ctx.request.accessToken = { Authorization: `Bearer ${apiResp.data.result.accessToken}` };
        }
      } else {
        await createAccesstoken(ctx);
      }
      await next();
    } catch (error) {
      console.log('----erorr', error);
    }
  },
};
