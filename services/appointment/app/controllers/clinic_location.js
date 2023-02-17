const config = require('../config/config');
const commonService = require('../services/common-service');
const locationValidator = require('../validators/clinic_location');
const request = require('../middleware/axios-request');
const responseMessages = require('../middleware/response-messages');


module.exports = {
  getList: async (ctx) => {
    try {
      const { error, validatedData } = await locationValidator.validateGetList(ctx.request.query);
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
  getNamesList: async (ctx) => {
    try {
      const { error, validatedData } = await locationValidator.validateGetNameList(ctx.request.query);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      let pageNo = 1;
      validatedData.limit = validatedData.itemsPerPage ? validatedData.itemsPerPage : 10;
      let sortArr = ['name', 'ASC'];
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
  getLocationsList: async (ctx) => {
    try {
      const { error, validatedData } = await locationValidator.validateGetLocationList(ctx.request.query);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      let pageNo = 1;
      validatedData.limit = validatedData.itemsPerPage ? validatedData.itemsPerPage : 10;
      let sortArr = ['location', 'ASC'];
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
  getByLocation: async (ctx) => {
    try {
      const apiResp = await request.post(ctx, `${ctx.req.hitUrl}`, ctx.request.body);
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
  getById: async (ctx) => {
    try {
      const { error } = await locationValidator.validateGetById(ctx.request.params);
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
  getNameById: async (ctx) => {
    try {
      const { error } = await locationValidator.validateGetById(ctx.request.params);
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
  deleteLocationById: async (ctx) => {
    try {
      const { error, validatedData } = await locationValidator.validateDeleteLocationById(ctx.request.query);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const appointmentCheckPayload = {
        clinic_location_id: [(validatedData.clinic_location_id || '')],
        limit: 1,
        all: 1,
        order: ['createdAt', 'DESC'],
        offset: 0
      }

      const appointmentGetResp = await request.post('', `${config.databaseUrl}/appointment/appointment/get-list`, appointmentCheckPayload, commonService.setHeaders(ctx.request.headers, ['authorization']));
      if (appointmentGetResp.data.result.count) {
        return ctx.res.conflict({ msg: responseMessages[1067] });
      }

      const apiResp = await request.delete(ctx, `${ctx.req.hitUrl}`);

      return ctx.res.success({ ...apiResp.data, statusCode: apiResp.status, });
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
  deleteNameById: async (ctx) => {
    try {
      const { error, validatedData } = await locationValidator.validateDeleteNameById(ctx.request.query);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }

      const appointmentCheckPayload = {
        clinic_location_id: [(validatedData.clinic_location_id || '')],
        clinic_name_id: [(validatedData.clinic_name_id || '')],
        itemsPerPage: 1,
        all: 1,
        limit: 1,
        order: ['createdAt', 'DESC'],
        offset: 0
      }

      const appointmentGetResp = await request.post('', `${config.databaseUrl}/appointment/appointment/get-list`, appointmentCheckPayload, commonService.setHeaders(ctx.request.headers, ['authorization']));
      if (appointmentGetResp.data.result.count) {
        return ctx.res.conflict({ msg: responseMessages[1067] });
      }

      const apiResp = await request.delete(ctx, `${ctx.req.hitUrl}`);

      return ctx.res.success({ ...apiResp.data, statusCode: apiResp.status, });
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
  saveRecord: async (ctx) => {
    try {
      const { error, validatedData } = await locationValidator.validateSave(ctx.request.body);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
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
      const { error, validatedData } = await locationValidator.validateUpdate(ctx.request.body);
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
