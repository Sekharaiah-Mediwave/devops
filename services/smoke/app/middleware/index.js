const { jwt } = require('../services/imports');

module.exports = {
  checkAddUrlToHit: (baseUrlToAppend) => async (ctx, next) => {
    ctx.req.hitUrl = baseUrlToAppend + ctx.req.url;
    await next();
  },
  checkSetToken: async (ctx, next) => {
    let token = ctx.request.headers.Authorization || ctx.request.headers.authorization;
    if (token) {
      token = token.substr('Bearer '.length);
      try {
        const decoded = await jwt.verify(token, ctx.request.headers.jwtsecret);
        if (decoded) {
          ctx.req.decoded = decoded;
        }
      } catch (error) {
        ctx.req.decoded = null;
      }
    }
    return await next();
  },
};
