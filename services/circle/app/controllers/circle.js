const circleValidator = require('../validators/circle');
const commonService = require('../services/common-service');
const config = require('../config/config');
const request = require('../middleware/axios-request');
const responseMessages = require('../middleware/response-messages');

module.exports = {
  inviteUser: async (ctx) => {
    try {
      const intitialRequestBody = ctx.request.body;
      const { error, validatedData } = await circleValidator.inviteUserCircle(ctx.request.body);
      if (error) {
        return ctx.res.unprocessableEntity({ msg: error.message });
      }
      const userData = await request.post(ctx, `${config.databaseUrl}/circle/check-user-available`, ctx.request.body);
      
      const header = {
        headers: {
          authorization: ctx.request.headers.authorization,
        },
      };
      const currUser = await request.get(null, `${config.databaseUrl}/account/get-user-data`, header);
      // const currUser = await request.get('', `${config.databaseUrl}/account/get-user-data?userId=`,  commonService.setHeaders(ctx.request.headers));
      console.log('currUser', currUser?.data?.result?.userRole?.roleInfo?.name);
    
      const availableUserData = (userData.data && userData.data.result) || '';
      const relationRoles = { patient: 'Patient', clinician: 'Clinician', family: 'Patient', carer: 'Patient' };
      if (currUser?.data?.result?.userRole?.roleInfo?.name != 'Super Admin') {
        if (validatedData.relationship === 'clinician' && !availableUserData) {
          return ctx.res.badRequest({
            msg: responseMessages[1005],
          });
        }
        if (
          validatedData.relationship !== 'clinician' &&
          availableUserData &&
          availableUserData.userRole &&
          availableUserData.userRole.roleInfo
        ) {
          if (
            availableUserData.userRole.roleInfo.name === 'Clinician' ||
            relationRoles[validatedData.relationship] !== availableUserData.userRole.roleInfo.name
          ) {
            return ctx.res.badRequest({
              msg: responseMessages[1004],
            });
          }
        } else if (
          validatedData.relationship === 'clinician' &&
          availableUserData &&
          availableUserData.userRole &&
          availableUserData.userRole.roleInfo
        ) {
          if (
            availableUserData.userRole.roleInfo.name !== 'Clinician' ||
            relationRoles[validatedData.relationship] !== availableUserData.userRole.roleInfo.name
          ) {
            return ctx.res.badRequest({
              msg: responseMessages[1006],
            });
          }
        }
      }

      if (!availableUserData) {
        const createdData = await request.post(
          ctx,
          `${config.databaseUrl}/circle/create-user-invite`,
          ctx.request.body
        );
        ctx.request.body = {
          invitedUserFname: intitialRequestBody.firstName,
          invitedUserLname: intitialRequestBody.lastName,
          invitedUserEmail: intitialRequestBody.email,
          inviteCode: createdData.data.result.inviteCode,
        };
        await request.post(ctx, `${config.emailUrl}/email/circle/invite-user`, ctx.request.body);
        return ctx.res.ok({
          msg: responseMessages[1001],
          result: { uuid: createdData?.data?.result?.uuid, inviteCode: createdData.data.result.inviteCode },
        });
      }
      
      ctx.request.body.toId = availableUserData.uuid;
      const connectToUser = await request.post(ctx, `${config.databaseUrl}/circle/create-circle`, ctx.request.body);
      ctx.request.body = {
        invitedUserEmail: intitialRequestBody.email,
        inviteCode: connectToUser.data.result.inviteCode,
      };
      await request.post(ctx, `${config.emailUrl}/email/circle/circle-connect`, ctx.request.body);
      return ctx.res.ok({ msg: responseMessages[1001] });
    } catch (error) {
      console.log('error.............', error);
      if (error.status) {
        if (error.status < 500) {
          return ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        }
        return ctx.res.internalServerError({ ...error.error });
      }
      return ctx.res.internalServerError({ error });
    }
  },
  acceptCircleInvite: async (ctx) => {
    try {
      const { error } = await circleValidator.circleAcceptOrDeniedOrSchema(ctx.request.body);
      if (error) {
        return ctx.res.unprocessableEntity({ msg: error.message });
      }
      const postResp = await request.post(ctx, `${config.databaseUrl}${ctx.req.url}`, ctx.request.body);
      return ctx.res.ok({ ...postResp.data });
    } catch (error) {
      console.log('error.............', error);
      if (error.status) {
        if (error.status < 500) {
          return ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        }
        return ctx.res.internalServerError({ ...error.error });
      }
      return ctx.res.internalServerError({ error });
    }
  },
  rejectCircleInvite: async (ctx) => {
    try {
      const { error } = await circleValidator.circleAcceptOrDeniedOrSchema(ctx.request.body);
      if (error) {
        return ctx.res.unprocessableEntity({ msg: error.message });
      }
      const postResp = await request.post(ctx, `${config.databaseUrl}${ctx.req.url}`, ctx.request.body);
      return ctx.res.ok({ ...postResp.data });
    } catch (error) {
      console.log('error.............', error);
      if (error.status) {
        if (error.status < 500) {
          return ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        }
        return ctx.res.internalServerError({ ...error.error });
      }
      return ctx.res.internalServerError({ error });
    }
  },
  cancelCircleInvite: async (ctx) => {
    try {
      const { error } = await circleValidator.circleCancelSchema(ctx.request.body);
      if (error) {
        return ctx.res.unprocessableEntity({ msg: error.message });
      }
      const postResp = await request.post(ctx, `${config.databaseUrl}${ctx.req.url}`, ctx.request.body);
      return ctx.res.ok({ ...postResp.data });
    } catch (error) {
      console.log('error.............', error);
      if (error.status) {
        if (error.status < 500) {
          return ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        }
        return ctx.res.internalServerError({ ...error.error });
      }
      return ctx.res.internalServerError({ error });
    }
  },
  getAllCircle: async (ctx) => {
    try {
      const getResp = await request.get(ctx, `${config.databaseUrl}${ctx.req.url}`);
      return ctx.res.ok({ ...getResp.data });
    } catch (error) {
      console.log('error.............', error);
      if (error.status) {
        if (error.status < 500) {
          return ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        }
        return ctx.res.internalServerError({ ...error.error });
      }
      return ctx.res.internalServerError({ error });
    }
  },
  getAllCircleUser: async (ctx) => {
    try {
      const getResp = await request.get(ctx, `${config.databaseUrl}${ctx.req.url}`);
      return ctx.res.ok({ ...getResp.data });
    } catch (error) {
      console.log('error.............', error);
      if (error.status) {
        if (error.status < 500) {
          return ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        }
        return ctx.res.internalServerError({ ...error.error });
      }
      return ctx.res.internalServerError({ error });
    }
  },
  getById: async (ctx) => {
    try {
      const { error } = await circleValidator.validateGetById(ctx.request.query);
      if (error) {
        return ctx.res.unprocessableEntity({ msg: error.message });
      }
      const getResp = await request.get(ctx, `${ctx.req.hitUrl}`);
      return ctx.res.ok({ ...getResp.data });
    } catch (error) {
      console.log('\n get by id error...', error);
      if (error.status) {
        if (error.status < 500) {
          return ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        }
        return ctx.res.internalServerError({ ...error.error });
      }
      return ctx.res.internalServerError({ error });
    }
  },
  getRequestReceived: async (ctx) => {
    try {
      const getResp = await request.get(ctx, `${config.databaseUrl}${ctx.req.url}`);
      return ctx.res.ok({ ...getResp.data });
    } catch (error) {
      console.log('error.............', error);
      if (error.status) {
        if (error.status < 500) {
          return ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        }
        return ctx.res.internalServerError({ ...error.error });
      }
      return ctx.res.internalServerError({ error });
    }
  },
  getRequestSent: async (ctx) => {
    try {
      const getResp = await request.get(ctx, `${config.databaseUrl}${ctx.req.url}`);
      return ctx.res.ok({ ...getResp.data });
    } catch (error) {
      console.log('error.............', error);
      if (error.status) {
        if (error.status < 500) {
          return ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        }
        return ctx.res.internalServerError({ ...error.error });
      }
      return ctx.res.internalServerError({ error });
    }
  },
  getConnectedUserByUserId: async (ctx) => {
    try {
      const { error, validatedData } = await circleValidator.validateGetConnectedUserByUserId(ctx.request.query);
      if (error) {
        return ctx.res.unprocessableEntity({ msg: error.message });
      }

      const keyArr = Object.keys(validatedData);
      const valueArr = keyArr.map((innerData) => validatedData[innerData]);

      const getResp = await request.get(
        ctx,
        commonService.updateQueryStringParameter(`${ctx.req.hitUrl}`, keyArr, valueArr)
      );
      return ctx.res.ok({ ...getResp.data });
    } catch (error) {
      console.log('error.............', error);
      if (error.status) {
        if (error.status < 500) {
          return ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        }
        return ctx.res.internalServerError({ ...error.error });
      }
      return ctx.res.internalServerError({ error });
    }
  },
  getCommunityUsers: async (ctx) => {
    try {
      const { error, validatedData } = await circleValidator.validateCommunityCircleUsersList(ctx.request.query);
      if (error) {
        return ctx.res.unprocessableEntity({ msg: error.message });
      }

      const keyArr = Object.keys(validatedData);
      const valueArr = keyArr.map((innerData) => validatedData[innerData]);

      const getResp = await request.get(
        ctx,
        commonService.updateQueryStringParameter(`${ctx.req.hitUrl}`, keyArr, valueArr)
      );
      return ctx.res.ok({ ...getResp.data });
    } catch (error) {
      console.log('\n get carer users error...', error);
      return ctx.res.badRequest({
        msg: (error.error && error.error.message) || responseMessages[1003],
      });
    }
  },
  updateCircle: async (ctx) => {
    try {
      const { error, validatedData } = await circleValidator.validateUserModuleUpdate(ctx.request.body);
      if (error) {
        return ctx.res.unprocessableEntity({ msg: error.message });
      }

      ctx.request.body = validatedData;
      const patchResp = await request.patch(ctx, ctx.req.hitUrl, ctx.request.body);
      return ctx.res.ok({ ...patchResp.data });
    } catch (error) {
      console.log('\n update circle modules error...', error);
      return ctx.res.badRequest({
        msg: (error.error && error.error.message) || responseMessages[1003],
      });
    }
  },
  revokeCircleConnection: async (ctx) => {
    try {
      const { error } = await circleValidator.circleAcceptOrDeniedOrSchema(ctx.request.body);
      if (error) {
        return ctx.res.unprocessableEntity({ msg: error.message });
      }
      const patchResp = await request.patch(ctx, `${config.databaseUrl}${ctx.req.url}`, ctx.request.body);
      return ctx.res.ok({ ...patchResp.data });
    } catch (error) {
      console.log('error.............', error);
      if (error.status) {
        if (error.status < 500) {
          return ctx.res.clientError({
            ...error.error,
            statusCode: error.status,
          });
        }
        return ctx.res.internalServerError({ ...error.error });
      }
      return ctx.res.internalServerError({ error });
    }
  },
};
