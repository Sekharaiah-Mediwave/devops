const responseMessages = require('../middleware/response-messages');
const client = require('../utilis/init_redis');

module.exports = {
  getCache: async (ctx) => {
    try {
      if (!ctx.request.body.key) {
        ctx.res.unprocessableEntity({ msg: responseMessages[1001] });
      }
      const existsResponse = await client.exists(ctx.request.body.key);
      if (existsResponse) {
        const response = await client.get(ctx.request.body.key);
        ctx.res.ok({ result: response });
        return;
      }
      ctx.res.unprocessableEntity({ msg: responseMessages[1002] });
      return;
    } catch (error) {
      console.log('\n redis get error...', error);
      if (error.response) {
        if (error.response.status < 500) {
          ctx.res.clientError({
            ...error.response.data,
            statusCode: error.response.status,
          });
        } else {
          ctx.res.internalServerError({ error: error.response.data });
        }
      } else {
        ctx.res.internalServerError({ error });
      }
    }
  },

  setCache: async (ctx) => {
    if (!ctx.request.body.key || !ctx.request.body.value) {
      ctx.res.unprocessableEntity({ msg: responseMessages[1001] });
    }
    try {
      const response = await client.set(ctx.request.body.key, ctx.request.body.value);
      ctx.res.ok({ result: response });
    } catch (error) {
      console.log('\n redis set error...', error);
      if (error.response) {
        if (error.response.status < 500) {
          ctx.res.clientError({
            ...error.response.data,
            statusCode: error.response.status,
          });
        } else {
          ctx.res.internalServerError({ error: error.response.data });
        }
      } else {
        ctx.res.internalServerError({ error });
      }
    }
  },
};
