const config = require('../config/config');
const commonService = require('../services/common-service');
const notificationValidator = require('../validators/notification');
const mapFhirData = require('../fhirMapping');
const request = require('../middleware/axios-request');

module.exports = {
  createScheduleNotification: async (ctx) => {
    try {
      const { error, validatedData } = await notificationValidator.validateSave(ctx.request.body);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      console.log(validatedData);
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
  updateScheduleNotification: async (ctx) => {
    try {
      const { error, validatedData } = await notificationValidator.validateSave(ctx.request.body);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      console.log(validatedData);
      const dbSaveResp = await request.put(ctx, `${ctx.req.hitUrl}`, validatedData);
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
  markAsRead: async (ctx) => {
    try {
      const { error, validatedData } = await notificationValidator.validateMarkAsRead(ctx.request.body);
      if (error) {
        ctx.res.unprocessableEntity({ error });
        return;
      }
      console.log(validatedData);
      const dbSaveResp = await request.put(ctx, `${ctx.req.hitUrl}`, validatedData);
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
  getScheduleNotification: async (ctx) => {
    try {
      const apiResp = await request.get(ctx, ctx.req.hitUrl);
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
  getNotification: async (ctx) => {
    try {
      const apiResp = await request.get(ctx, ctx.req.hitUrl);
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
  getNotificationCount: async (ctx) => {
    try {
      const apiResp = await request.get(ctx, ctx.req.hitUrl);
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
