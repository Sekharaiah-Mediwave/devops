const request = require('../middleware/axios-request');

module.exports = {
  get: async (ctx) => {
    try {
      const getResp = await request.get(ctx, `${ctx.req.hitUrl}`);
      ctx.res.success({
        ...getResp.data,
        statusCode: getResp.status,
      });
    } catch (error) {
      console.log('\n get error...', error);
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
  post: async (ctx) => {
    try {
      const postResp = await request.post(ctx, `${ctx.req.hitUrl}`, ctx.request.body);
      ctx.res.success({
        ...postResp.data,
        statusCode: postResp.status,
      });
    } catch (error) {
      console.log('\n post error...', error);
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
  put: async (ctx) => {
    try {
      const putResp = await request.put(ctx, `${ctx.req.hitUrl}`, ctx.request.body);
      ctx.res.success({
        ...putResp.data,
        statusCode: putResp.status,
      });
    } catch (error) {
      console.log('\n put error...', error);
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
  patch: async (ctx) => {
    try {
      const patchResp = await request.patch(ctx, `${ctx.req.hitUrl}`, ctx.request.body);
      ctx.res.success({
        ...patchResp.data,
        statusCode: patchResp.status,
      });
    } catch (error) {
      console.log('\n patch error...', error);
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
  delete: async (ctx) => {
    try {
      const deleteResp = await request.delete(ctx, `${ctx.req.hitUrl}`);
      ctx.res.success({
        ...deleteResp.data,
        statusCode: deleteResp.status,
      });
    } catch (error) {
      console.log('\n delete error...', error);
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
