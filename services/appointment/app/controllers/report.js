const config = require('../config/config');
const commonService = require('../services/common-service');
const request = require('../middleware/axios-request');


module.exports = {
  dashboardCount: async (ctx) => {
    try {
      const postResp = await request.get(
        ctx,
        ctx.req.hitUrl
      );
      ctx.res.success({
        ...postResp.data,
        statusCode: postResp.status,
      });
    } catch (error) {
      if (error.status) {
        if (error.status < 500) {
          ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        } else {
          ctx.res.internalServerError({ ...error.error });
        }
      } else {
        ctx.res.internalServerError({ error });
      }
    }
  },

};
