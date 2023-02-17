module.exports = {
    checkAddUrlToHit: (baseUrlToAppend) => async (ctx, next) => {
        ctx.req.hitUrl = baseUrlToAppend + ctx.req.url;
        await next();
    },
};