const config = require('../config/config');
const { jwt } = require('../services/imports');
const client = require('../services/redis-service');
const responseMessages = require('./response-messages');

module.exports = {
  isAuthorized: async (ctx, next) => {
    let token = ctx.request.headers.Authorization || ctx.request.headers.authorization;

    if (token) {
      token = token.substr('Bearer '.length);
      try {
        const decoded = await jwt.verify(token, config.jwtSecret);
        if (!decoded) {
          return ctx.res.unauthorized({ msg: responseMessages[1001] });
        }
        const response = await client.get(`user-token:${decoded.uuid}`);
        if (!response || (response && response != token)) {
          return ctx.res.unauthorized({ msg: responseMessages[1002] });
        }
        ctx.req.decoded = decoded;
        return await next();
      } catch (error) {
        return ctx.res.unauthorized({ msg: responseMessages[1003] });
      }
    } else {
      return ctx.res.unauthorized({ msg: responseMessages[1004] });
    }
  },
  checkAddUrlToHit: (baseUrlToAppend) => async (ctx, next) => {
    ctx.req.hitUrl = baseUrlToAppend + ctx.req.url;
    console.log(baseUrlToAppend, ctx.req.hitUrl, 'in-');
    return await next();
  },
  checkRoles:
    (allowedRolesShortNames = []) =>
    async (ctx, next) => {
      try {
        const allowedRoles = allowedRolesShortNames.map((roleShortName) => config.roleNames[roleShortName] || '');
        const roleAllowed = allowedRoles.includes(ctx.req.decoded.role);

        if (roleAllowed) {
          return await next();
        }
        return ctx.res.unauthorized({ msg: responseMessages[1005] });
      } catch (error) {
        console.log('\n role check error...', error);
        return ctx.res.unauthorized({ msg: responseMessages[1006] });
      }
    },
};
