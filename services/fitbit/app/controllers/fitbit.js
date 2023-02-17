const commonService = require('../services/common-service');
const request = require('../middleware/axios-request');
const fitbitValidator = require('../validators/fitbit');


module.exports = {
    getFitbit: async (ctx) => {
        try {
            const getResp = await request.get(ctx, `${ctx.req.hitUrl}`, commonService.setHeaders(ctx.request.headers));
            ctx.res.success({
                ...getResp.data,
                statusCode: getResp.status,
            });
        } catch (error) {
            console.log('\n fitbit error...', error);
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
    fitBitOauth2Token: async (ctx) => {
        try {
            const { error, validatedData } = await fitbitValidator.validateFitBitOauth2Token({ ...ctx.request.body, ...ctx.request.query });
            if (error) {
                console.log('\n error...', error);
                ctx.res.unprocessableEntity({ error });
                return;
            }

            const postResp = await request.post(ctx, `${ctx.req.hitUrl}`, validatedData);
            ctx.res.success({
                ...postResp.data,
                statusCode: postResp.status,
            });
            return;
        } catch (error) {
            console.log('\n fitBit Oauth2 Token error...', error);
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
    getFitBitSleepLogByDate: async (ctx) => {
        try {
            const { error, validatedData } = await fitbitValidator.validateFitBitSleepLogByDate(ctx.request.query);
            if (error) {
                console.log('\n error...', error);
                ctx.res.unprocessableEntity({ error });
                return;
            }
            const getResp = await request.get(ctx, `${ctx.req.hitUrl}`, commonService.setHeaders(ctx.request.headers));
            ctx.res.success({
                ...getResp.data,
                statusCode: getResp.status,
            });
        } catch (error) {
            console.log('\n fitbit error...', error);
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
    getFitBitSleepLogByDateRange: async (ctx) => {
        try {
            const { error, validatedData } = await fitbitValidator.validateFitBitSleepLogByDateRange(ctx.request.query);
            if (error) {
                console.log('\n error...', error);
                ctx.res.unprocessableEntity({ error });
                return;
            }
            const getResp = await request.get(ctx, `${ctx.req.hitUrl}`, commonService.setHeaders(ctx.request.headers));
            ctx.res.success({
                ...getResp.data,
                statusCode: getResp.status,
            });
        } catch (error) {
            console.log('\n fitbit error...', error);
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
    getFitBitSleepGoal: async (ctx) => {
        try {
            const { error, validatedData } = await fitbitValidator.validateFitBitSleepGoal(ctx.request.query);
            if (error) {
                console.log('\n error...', error);
                ctx.res.unprocessableEntity({ error });
                return;
            }

            const getResp = await request.get(ctx, `${ctx.req.hitUrl}`, commonService.setHeaders(ctx.request.headers));
            ctx.res.success({
                ...getResp.data,
                statusCode: getResp.status,
            });
        } catch (error) {
            console.log('\n fitbit error...', error);
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
    getFitBitStepByDate: async (ctx) => {
        try {
            const { error, validatedData } = await fitbitValidator.validateFitBitStepByDate(ctx.request.query);
            if (error) {
                console.log('\n error...', error);
                ctx.res.unprocessableEntity({ error });
                return;
            }
            const getResp = await request.get(ctx, `${ctx.req.hitUrl}`, commonService.setHeaders(ctx.request.headers));
            ctx.res.success({
                ...getResp.data,
                statusCode: getResp.status,
            });
        } catch (error) {
            console.log('\n fitbit error...', error);
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
    getFitBitStepByDateRange: async (ctx) => {
        try {
            const { error, validatedData } = await fitbitValidator.validateFitBitStepByDateRange(ctx.request.query);
            if (error) {
                console.log('\n error...', error);
                ctx.res.unprocessableEntity({ error });
                return;
            }
            const getResp = await request.get(ctx, `${ctx.req.hitUrl}`, commonService.setHeaders(ctx.request.headers));
            ctx.res.success({
                ...getResp.data,
                statusCode: getResp.status,
            });
        } catch (error) {
            console.log('\n fitbit error...', error);
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
    disconnnected: async (ctx) => {
        try {
            const getResp = await request.post(ctx, `${ctx.req.hitUrl}`, {}, commonService.setHeaders(ctx.request.headers));
            ctx.res.success({
                ...getResp.data,
                statusCode: getResp.status,
            });
        } catch (error) {
            console.log('\n fitbit error...', error);
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
