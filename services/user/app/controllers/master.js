const commonService = require('../services/common-service');
const masterValidator = require('../validators/master');
const request = require('../middleware/axios-request');

module.exports = {
  saveData: async (ctx) => {
    try {
      const { error, validatedData } = await masterValidator.validateSave(ctx.request.body);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const postResp = await request.post(
        ctx,
        `${ctx.req.hitUrl}`,
        validatedData,
        commonService.setHeaders(ctx.request.headers)
      );
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
    }
  },
  updateData: async (ctx) => {
    try {
      const { error, validatedData } = await masterValidator.validateUpdate(ctx.request.body);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const putResp = await request.put(
        ctx,
        `${ctx.req.hitUrl}`,
        validatedData,
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...putResp.data,
        statusCode: putResp.status,
      });
      return;
    } catch (error) {
      console.log('\n master table find by id error...', error);
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
  getListsFromTable: async (ctx) => {
    try {
      const { error, validatedData } = await masterValidator.validateGetList(ctx.request.query);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const keyArr = Object.keys(validatedData);
      const valueArr = keyArr.map((innerData) => validatedData[innerData]);

      const getResp = await request.get(
        ctx,
        commonService.updateQueryStringParameter(`${ctx.req.hitUrl}`, keyArr, valueArr),
        commonService.setHeaders(ctx.request.headers)
      );
      ctx.res.success({
        ...getResp.data,
        statusCode: getResp.status,
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
    }
  },
  getById: async (ctx) => {
    try {
      const { error } = await masterValidator.validateGetById(ctx.request.query);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const getResp = await request.get(ctx, `${ctx.req.hitUrl}`, commonService.setHeaders(ctx.request.headers));
      ctx.res.success({
        ...getResp.data,
        statusCode: getResp.status,
      });
      return;
    } catch (error) {
      console.log('\n master table find by id error...', error);
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
  deleteData: async (ctx) => {
    try {
      const { error } = await masterValidator.validateDelete(ctx.request.query);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const deleteResp = await request.delete(ctx, `${ctx.req.hitUrl}`, commonService.setHeaders(ctx.request.headers));
      ctx.res.success({
        ...deleteResp.data,
        statusCode: deleteResp.status,
      });
      return;
    } catch (error) {
      console.log('\n master table find by id error...', error);
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
