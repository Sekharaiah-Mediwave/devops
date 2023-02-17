const commonService = require('../services/common-service');
const fitbitValidator = require('../validators/fitbit');
const request = require('../middleware/axios-request');

module.exports = {
    saveData: async (ctx) => {
        try {
            const {
                error,
                validatedData
            } = await fitbitValidator.validateSave(ctx.request.body);
            if (error) {
                ctx.res.unprocessableEntity({ error });
                return;
            }

            const postResp = await request.post(ctx, `${ctx.req.hitUrl}`, validatedData, commonService.setHeaders(ctx.request.headers));
            ctx.res.success({
                ...postResp.data,
                statusCode: postResp.status,
            });
            return;
        } catch (error) {
            console.log('\n master table find list error...', error);
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
            return;
        }
    },
};