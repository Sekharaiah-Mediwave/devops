const commonService = require('../services/common-service');
const statusValidator = require('../validators/status');
const request = require('../middleware/axios-request');


module.exports = {
  getAllStatus: async (ctx) => {
    try {
      const postResp = await request.get(ctx, ctx.req.hitUrl);
      return ctx.res.success({ ...postResp.data, statusCode: postResp.status, });
    } catch (error) {
      if (error.status) {
        if (error.status < 500) {
          return ctx.res.clientError({ ...error.error, statusCode: error.status, });
        } else {
          return ctx.res.internalServerError({ ...error.error });
        }
      } else {
        return ctx.res.internalServerError({ error });
      }
    }
  },
  getList: async (ctx) => {
    try {
      const reqBody = ctx.request.query;
      if (reqBody.status) {
        reqBody.status = reqBody.status.split(',').map(statusData => statusData.trim());
      }
      const { error, validatedData } = await statusValidator.validateGetList(reqBody);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      let pageNo = 1;
      validatedData.limit = validatedData.itemsPerPage ? validatedData.itemsPerPage : 10;
      let sortArr = ['createdAt', 'DESC'];
      let fieldSplitArr = [];
      if (validatedData.pageNo) {
        const temp = parseInt(validatedData.pageNo);
        if (temp && !isNaN(temp)) {
          pageNo = (temp - 1);
        }
      }
      validatedData.offset = pageNo * validatedData.limit;
      if (validatedData.sortField) {
        fieldSplitArr = validatedData.sortField.split('.');
        if (fieldSplitArr.length == 1) {
          sortArr[0] = validatedData.sortField;
        } else {
          for (let idx = 0; idx < fieldSplitArr.length; idx++) {
            const element = fieldSplitArr[idx];
            fieldSplitArr[idx] = element.replace(/\[\/?.+?\]/ig, '');
          }
          sortArr = fieldSplitArr;
        }
      }

      if (validatedData.sortOrder) {
        if ((fieldSplitArr.length == 1) || (fieldSplitArr.length == 0)) {
          sortArr[1] = validatedData.sortOrder;
        } else {
          sortArr.push(validatedData.sortOrder);
        }
      }
      validatedData.order = sortArr;

      const postResp = await request.post('', `${ctx.req.hitUrl}`, validatedData, commonService.setHeaders(ctx.request.headers, ['authorization']));
      return ctx.res.success({
        ...postResp.data,
        statusCode: postResp.status,
      });
    } catch (error) {
      console.log('\n locations get list error...', error);
      if (error.status) {
        if (error.status < 500) {
          return ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        } else {
          return ctx.res.internalServerError({ ...error.error });
        }
      } else {
        return ctx.res.internalServerError({ error });
      }
    }
  },
  getById: async (ctx) => {
    try {
      const { error } = await statusValidator.validateGetById(ctx.request.query);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const apiResp = await request.get(ctx, `${ctx.req.hitUrl}`);

      ctx.res.success({
        ...apiResp.data,
        statusCode: apiResp.status,
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
  deleteById: async (ctx) => {
    try {
      const { error } = await statusValidator.validateGetById(ctx.request.query);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const apiResp = await request.delete(ctx, `${ctx.req.hitUrl}`);

      ctx.res.success({
        ...apiResp.data,
        statusCode: apiResp.status,
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
  saveRecord: async (ctx) => {
    try {
      const { error, validatedData } = await statusValidator.validateSave(ctx.request.body);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      console.log('\n validatedData...', validatedData);
      const dbSaveResp = await request.post(ctx, `${ctx.req.hitUrl}`, validatedData);
      ctx.res.success({
        ...dbSaveResp.data,
        statusCode: dbSaveResp.status,
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
  updateRecord: async (ctx) => {
    try {
      const { error, validatedData } = await statusValidator.validateUpdate(ctx.request.body);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      const apiResp = await request.put(ctx, `${ctx.req.hitUrl}`, validatedData);
      ctx.res.success({
        ...apiResp.data,
        statusCode: apiResp.status,
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
