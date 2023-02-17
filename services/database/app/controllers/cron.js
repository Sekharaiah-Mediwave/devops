const dbService = require('../services/db-service');
const responseMessages = require('../middleware/response-messages');

const insertRecord = async (insertPayload) => await dbService.create('cron_jobs', insertPayload, {});

const updateRecord = async (updatePayload, findQuery) =>
  await dbService.update('cron_jobs', updatePayload, findQuery, {});

const deleteRecord = async (findQuery) => await dbService.destroy('cron_jobs', findQuery, {});

module.exports = {
  insertRecord,
  updateRecord,
  deleteRecord,
  getAllLists: async (ctx) => {
    try {
      const cronSchedules = await dbService.findAll('cron_jobs', {});

      ctx.res.ok({ result: cronSchedules.map((innerData) => innerData.toJSON()) });
      return;
    } catch (error) {
      console.log('\n cron find list error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  createSchedule: async (ctx) => {
    try {
      const insertPayload = {
        name: ctx.request.body.name,
        mailApiRoute: ctx.request.body.mailApiRoute,
        cronInitialValues: ctx.request.body.cronInitialValues,
        cronScheduleTime: ctx.request.body.cronScheduleTime,
      };

      const insertResp = await insertRecord(insertPayload);

      ctx.res.ok({ result: insertResp });
      return;
    } catch (error) {
      console.log('\n cron create error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  updateSchedule: async (ctx) => {
    try {
      const updatePayload = {
        name: ctx.request.body.name,
        mailApiRoute: ctx.request.body.mailApiRoute,
        cronInitialValues: ctx.request.body.cronInitialValues,
        cronScheduleTime: ctx.request.body.cronScheduleTime,
      };

      const whereQuery = {};
      if (ctx.request.body.uuid) {
        whereQuery.uuid = ctx.request.body.uuid;
      }
      if (ctx.request.body.name) {
        whereQuery.name = ctx.request.body.name;
      }

      if (Object.keys(whereQuery).length === 0) {
        ctx.res.unprocessableEntity({ msg: responseMessages[1064] });
        return;
      }

      const findResp = await dbService.findOne('cron_jobs', { where: whereQuery, individualHooks: true });

      if (!findResp) {
        ctx.res.notFound({ msg: responseMessages[1063] });
        return;
      }

      const updateResp = await updateRecord(updatePayload, { where: whereQuery, individualHooks: true });

      ctx.res.ok({ result: updateResp[0] });
      return;
    } catch (error) {
      console.log('\n cron update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  deleteSchedule: async (ctx) => {
    try {
      const whereQuery = {};
      if (ctx.request.body.uuid) {
        whereQuery.uuid = ctx.request.body.uuid;
      }
      if (ctx.request.body.name) {
        whereQuery.name = ctx.request.body.name;
      }

      if (Object.keys(whereQuery).length === 0) {
        ctx.res.unprocessableEntity({ msg: responseMessages[1064] });
        return;
      }

      const findResp = await dbService.findOne('cron_jobs', { where: whereQuery, individualHooks: true });

      if (!findResp) {
        ctx.res.notFound({ msg: responseMessages[1063] });
        return;
      }

      const updateResp = await deleteRecord({ where: whereQuery, individualHooks: true });

      ctx.res.ok({ result: updateResp[0] });
      return;
    } catch (error) {
      console.log('\n cron delete error...', error);
      ctx.res.internalServerError({ error });
    }
  },
};
