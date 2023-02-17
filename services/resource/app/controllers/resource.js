const config = require('../config/config');
const commonService = require('../services/common-service');
const mapFhirData = require('../fhirMapping');
const request = require('../middleware/axios-request');
const { body } = require('koa/lib/response');

module.exports = {
  getContent: async (ctx) => {
    try {
      console.log('ctx.req.hitUrl', ctx.req.hitUrl);
      ctx.req.hitUrl = `${config.resourceUrl}api/content/tp/getAll${ctx.req.url.split('/content')[1]}`;
      ctx.request.headers = ctx.request.accessToken;
      console.log(ctx.request.accessToken, 'ctx.request.accessToken');
      const apiResp = await request.get(ctx, ctx.req.hitUrl);
      ctx.res.success({
        result: apiResp.data,
        msg: apiResp.data.message,
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
  getFilterType: async (ctx) => {
    try {
      ctx.req.hitUrl = `${config.resourceUrl}api/oauth/all-filter-types${ctx.req.url?.split('/filter-types')[1]}`;
      console.log('ctx.req.hitUrl', ctx.req.hitUrl);
      ctx.request.headers = ctx.request.accessToken;
      console.log(ctx.request.accessToken, 'ctx.request.accessToken');
      const apiResp = await request.get(ctx, ctx.req.hitUrl);
      ctx.res.success({
        result: apiResp.data,
        msg: apiResp.data.message,
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
  getFilterTypeCount: async (ctx) => {
    try {
      ctx.req.hitUrl = `${config.resourceUrl}api/oauth/get-resources-count-type`;
      console.log('ctx.req.hitUrl', ctx.req.hitUrl);
      ctx.request.headers = ctx.request.accessToken;
      console.log(ctx.request.accessToken, 'ctx.request.accessToken');
      const apiResp = await request.get(ctx, ctx.req.hitUrl);
      ctx.res.success({
        result: apiResp.data,
        msg: apiResp.data.message,
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
  getResource: async (ctx) => {
    try {
      console.log('/user/resource-library----', ctx.request.headers);
      const header = {
        headers: {
          authorization: ctx.request.headers.authorization,
        },
      };
      ctx.req.hitUrl = `${config.resourceUrl}api/oauth/tp/getResources`;
      console.log('ctx.req.hitUrl', ctx.req.hitUrl);
      ctx.request.headers = ctx.request.accessToken;
      console.log(ctx.request.accessToken, 'ctx.request.accessToken', ctx.req.request);
      const apiResp = await request.post(ctx, ctx.req.hitUrl, ctx.request.body);
      console.log('/user/resource-library----',ctx.request.headers);

      if(header.headers?.authorization){
        console.log("header.headers?.authorization",header.headers?.authorization);
        const userFavourite = await request.get(null, `${config.databaseUrl}/user/resource-library`, header);
        const reminderList = await request.get(null, `${config.databaseUrl}/common/get-event-reminder-by-user`, header);
        console.log(reminderList, 'userFavourite',userFavourite);
        if (userFavourite.data?.result?.favorites && userFavourite.data?.result?.favorites.length > 0) {
          apiResp.data.data.contents.map((data) => {
            const index = userFavourite.data.result.favorites.map((object) => object.resource_id).indexOf(data._id);
            if (index != -1) {
              data.isFavourite = true;
            } else {
              data.isFavourite = false;
            }
          });
        }
        if (reminderList.data?.result && reminderList.data?.result?.length > 0) {
          apiResp.data.data.contents.map((data) => {
            const index = reminderList.data.result.map((object) => object.resource_id).indexOf(data._id);
            if (index != -1) {
              data.isReminderSet = true;
            } else {
              data.isReminderSet = false;
            }
          });
        }
      }
      ctx.res.success({
        result: apiResp.data,
        msg: apiResp.data.message,
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
  getFavouriteResource: async (ctx) => {
    try {
      const header = {
        headers: {
          authorization: ctx.request.headers.authorization,
        },
      };
      const userFavourite = await request.get(null, `${config.databaseUrl}/user/resource-library`, header);
      if (userFavourite.data?.result?.favorites && userFavourite.data?.result?.favorites.length > 0) {
        const ids = userFavourite.data.result.favorites.map((object) => object.resource_id);
        ctx.request.body.filter._id = ids;
        console.log(ctx.request.body.filter);
        ctx.req.hitUrl = `${config.resourceUrl}api/oauth/tp/getResources`;
        console.log('ctx.req.hitUrl', ctx.req.hitUrl);
        ctx.request.headers = ctx.request.accessToken;
        console.log(ctx.request.accessToken, 'ctx.request.accessToken', ctx.req.request);
        const apiResp = await request.post(ctx, ctx.req.hitUrl, ctx.request.body);
        ctx.res.success({
          result: apiResp.data,
          msg: apiResp.data.message,
        });
      } else {
        ctx.res.success({
          result: {
            status: true,
            message: 'Content list',
            data: {
              contents: [],
            },
          },
          msg: '',
        });
      }
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
  createResourceReinder: async (ctx) => {
    try {
      const postResp = await request.post(ctx, `${config.databaseUrl}/common/create-event-reminder`, ctx.request.body);
      ctx.res.ok({
        ...postResp.data,
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
  getResourceReinder: async (ctx) => {
    try {
      const postResp = await request.get(
        ctx,
        `${config.databaseUrl}/common/get-event-reminder${ctx.req.url.split('/get-event-reminder')[1]}`
      );
      ctx.res.ok({
        ...postResp.data,
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
  createRecommendedResource: async (ctx) => {
    try {
      const postResp = await request.post(ctx, `${ctx.req.hitUrl}`, ctx.request.body);
      ctx.res.ok({
        ...postResp.data,
      });
    } catch (error) {
      console.log('\n alcohol save error...', error);
      if (error.status) {
        if (error.status < 500) {
          ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        } else {
          ctx.res.internalServerError({ error: error.error });
        }
      } else {
        ctx.res.internalServerError({ error });
      }
    }
  },
  getRecommendedResource: async (ctx) => {
    try {
      const header = {
        headers: {
          authorization: ctx.request.headers.authorization,
        },
      };
      const getResp = await request.get(null, `${ctx.req.hitUrl}`, header);
      console.log('/user/resource-library----', getResp?.data);
      if(getResp?.data?.result?.resource_ids?.length > 0){
      console.log('/user/resource-library---->>');

        const userFavourite = await request.get(null, `${config.databaseUrl}/user/resource-library`, header);
        const reminderList = await request.get(null, `${config.databaseUrl}/common/get-event-reminder-by-user`, header);
        console.log(reminderList, 'userFavourite');
        ctx.req.hitUrl = `${config.resourceUrl}api/oauth/tp/getResources`;
        console.log('ctx.req.hitUrl', ctx.req.hitUrl);
        ctx.request.headers = ctx.request.accessToken;
        let {filter,...body} = ctx.request.body;
        if(!filter){
          filter = {}
        }
        console.log(ctx.request.accessToken, 'ctx.request.accessToken',  ctx.req.hitUrl, {
          ...body,
          // "page": 1,
          // "perPage" :getResp?.data?.result?.resource_ids?.length,
          "filter": { ...filter, "ids": getResp?.data?.result?.resource_ids }
      });
        const apiResp = await request.post(ctx, ctx.req.hitUrl, {
          ...body,
          // "page": 1,
          // "perPage" :getResp?.data?.result?.resource_ids?.length,
          "filter": { ...filter, "ids": getResp?.data?.result?.resource_ids }
      });
      console.log("apiResp--->",apiResp.data);
        if (userFavourite.data?.result?.favorites && userFavourite.data?.result?.favorites.length > 0) {
          apiResp.data.data.contents.map((data) => {
            const index = userFavourite.data.result.favorites.map((object) => object.resource_id).indexOf(data._id);
            if (index != -1) {
              data.isFavourite = true;
            } else {
              data.isFavourite = false;
            }
          });
        }
        if (reminderList.data?.result && reminderList.data?.result?.length > 0) {
          apiResp.data.data.contents.map((data) => {
            const index = reminderList.data.result.map((object) => object.resource_id).indexOf(data._id);
            if (index != -1) {
              data.isReminderSet = true;
            } else {
              data.isReminderSet = false;
            }
          });
        }
        return ctx.res.success({
          result: apiResp.data,
          msg: apiResp.data.message,
        });
      }
      return ctx.res.success({
        ...getResp.data,
        statusCode: getResp.status,
      });
    } catch (error) {
      console.log('\n problem get error...', error);
      if (error.status) {
        if (error.status < 500) {
          ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        } else {
          ctx.res.internalServerError({ error: error.error });
        }
      } else {
        ctx.res.internalServerError({ error });
      }
    }
  },
};
