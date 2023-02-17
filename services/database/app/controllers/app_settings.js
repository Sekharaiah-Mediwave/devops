const dbService = require('../services/db-service');
const responseMessages = require('../middleware/response-messages');

module.exports = {
  // Maia Admin Settings

  getMaiaAdminAppSettings: async (ctx) => {
    try {
      const findQuery = { attributes: ['globalSettings'] };

      const findRes = await dbService.findOne('app_settings', findQuery, {}, {});

      if (!findRes) {
        ctx.res.notFound({ msg: responseMessages[1154] });
        return;
      }

      ctx.res.ok({ result: { userSetting: findRes } });
      return;
    } catch (error) {
      console.log('\n getAppSettings error...', error);
      ctx.res.internalServerError({ error });
    }
  },

  updateMaiaAdminAppSettings: async (ctx) => {
    try {
      const findQuery = { where: {} };

      const findRes = await dbService.findOne('app_settings', findQuery, {}, {});

      const updateData = {
        globalSettings: ctx.request.body.globalSettings,
        updatedBy: ctx.req.decoded.uuid,
      };
      if (!findRes) {
        updateData.createdBy = ctx.req.decoded.uuid;
        const insertResp = await dbService.create('app_settings', updateData, {});
        return ctx.res.ok({ result: insertResp });
      }

      const updateResp = await dbService.update('app_settings', updateData, findQuery);
      return ctx.res.ok({ result: updateResp });
    } catch (error) {
      console.log('\n updateAppSettings error...', error);
      ctx.res.internalServerError({ error });
    }
  },

  // System  Admin User Settings
  getUserAppSettings: async (ctx) => {
    try {
      const findQuery = { attributes: ['globalSettings', 'userSettings'] };

      const findRes = await dbService.findOne('app_settings', findQuery, {}, {});

      if (!findRes) {
        ctx.res.notFound({ msg: responseMessages[1154] });
        return;
      }

      let resultData;
      if (findRes && findRes.userSettings !== null) {
        resultData = findRes.userSettings;
      } else {
        resultData = findRes.globalSettings;
      }
      ctx.res.ok({ result: { globalSettings: resultData } });
      return;
    } catch (error) {
      console.log('\n getAppSettings error...', error);
      ctx.res.internalServerError({ error });
    }
  },

  updateUserAppSettings: async (ctx) => {
    try {
      const findQuery = { where: {} };

      const findRes = await dbService.findOne('app_settings', findQuery, {}, {});

      const updateData = {
        userSettings: ctx.request.body.userSettings,
        updatedBy: ctx.req.decoded.uuid,
      };
      if (!findRes) {
        updateData.createdBy = ctx.req.decoded.uuid;
        const insertResp = await dbService.create('app_settings', updateData, {});
        return ctx.res.ok({ result: insertResp });
      }

      const updateResp = await dbService.update('app_settings', updateData, findQuery);
      return ctx.res.ok({ result: updateResp });
    } catch (error) {
      console.log('\n updateAppSettings error...', error);
      ctx.res.internalServerError({ error });
    }
  },
};
