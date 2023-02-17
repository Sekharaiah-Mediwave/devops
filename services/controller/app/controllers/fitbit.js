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
        return;
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
        return;
    },
};