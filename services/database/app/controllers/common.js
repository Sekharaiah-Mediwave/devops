const commonService = require('../services/common-service');
const dbService = require('../services/db-service');
const { uuidv4, moment } = require('../services/imports');
const { Sequelize } = require('../config/sequelize');

const { Op } = Sequelize;
const responseMessages = require('../middleware/response-messages');
const config = require('../config/config');

module.exports = {
  getResourceToken: async (ctx) => {
    try {
      const resourceToken = await dbService.findOne('common', {
        attributes: ['uuid', 'accessToken', 'refreshToken', 'expiryDate'],
      });
      // console.log(resourceToken,"resourceToken");
      return ctx.res.ok({ result: resourceToken });
    } catch (error) {
      return ctx.res.internalServerError({ error });
    }
  },
  createResourceToken: async (ctx) => {
    try {
      const { accessToken, refreshToken, expiryDate } = ctx.request.body;
      await dbService.destroy('common', { where: {} });

      const createRoom = await dbService.create('common', {
        uuid: uuidv4(),
        accessToken,
        refreshToken,
        expiryDate: expiryDate || moment().add(1, 'day'),
      });
      return ctx.res.ok({ result: createRoom });
    } catch (error) {
      return ctx.res.internalServerError({ error });
    }
  },
  getResourceReminder: async (ctx) => {
    try {
      const resourceReminder = await dbService.findAll('event_reminder', {
        where: {
          resource_id: ctx.request.query.resourceId,
          user_id: ctx.req.decoded.uuid,
        },
      });
      // console.log(resourceReminder,"resourceReminder");
      return ctx.res.ok({ result: resourceReminder });
    } catch (error) {
      return ctx.res.internalServerError({ error });
    }
  },
  getResourceReminderByUserId: async (ctx) => {
    try {
      const resourceReminder = await dbService.findAll('event_reminder', {
        where: {
          user_id: ctx.req.decoded.uuid,
        },
      });
      // console.log(resourceReminder,"resourceReminder");
      return ctx.res.ok({ result: resourceReminder });
    } catch (error) {
      return ctx.res.internalServerError({ error });
    }
  },
  getResourceReminderByDate: async (ctx) => {
    try {
      const resourceReminder = await dbService.findAll('event_reminder', {
        where: {
          reminder_time: { [Op.between]: [ctx.request.query.sdate, ctx.request.query.edate] },
        },
        include: [
          {
            model: 'user',
            as: 'userInfo',
            attributes: ['uuid', 'firstName', 'lastName', 'email'],
          },
        ],
      });
      // console.log(resourceReminder,"resourceReminder");
      return ctx.res.ok({ result: resourceReminder });
    } catch (error) {
      return ctx.res.internalServerError({ error });
    }
  },
  createResourceReminder: async (ctx) => {
    try {
      const { resourceId, reminderTime, reminderType } = ctx.request.body;
      await dbService.destroy('event_reminder', { where: { user_id: ctx.req.decoded.uuid, resource_id: resourceId } });
      if (reminderType.indexOf('10') != -1) {
        await dbService.create('event_reminder', {
          uuid: uuidv4(),
          user_id: ctx.req.decoded.uuid,
          resource_id: resourceId,
          reminder_time: moment(new Date(reminderTime)).add(-10, 'm').toDate(),
          reminder_type: '10',
        });
      }
      if (reminderType.indexOf('30') != -1) {
        await dbService.create('event_reminder', {
          uuid: uuidv4(),
          user_id: ctx.req.decoded.uuid,
          resource_id: resourceId,
          reminder_time: moment(new Date(reminderTime)).add(-30, 'm').toDate(),
          reminder_type: '30',
        });
      }
      if (reminderType.indexOf('60') != -1) {
        await dbService.create('event_reminder', {
          uuid: uuidv4(),
          user_id: ctx.req.decoded.uuid,
          resource_id: resourceId,
          reminder_time: moment(new Date(reminderTime)).add(-60, 'm').toDate(),
          reminder_type: '60',
        });
      }
      if (reminderType.indexOf('1 day') != -1) {
        await dbService.create('event_reminder', {
          uuid: uuidv4(),
          user_id: ctx.req.decoded.uuid,
          resource_id: resourceId,
          reminder_time: moment(new Date(reminderTime)).add(-1, 'd').toDate(),
          reminder_type: '1 day',
        });
      }
      return ctx.res.ok({
        result: null,
        msg: 'success',
      });
    } catch (error) {
      return ctx.res.internalServerError({ error });
    }
  },
};
