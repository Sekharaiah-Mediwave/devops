const commonService = require('../services/common-service');
const dbService = require('../services/db-service');
const { _, moment, uuidv4 } = require('../services/imports');
const { Sequelize } = require('../config/sequelize');

const { Op } = Sequelize;
const responseMessages = require('../middleware/response-messages');

module.exports = {
  saveRecord: async (ctx) => {
    try {
      const savePayload = {
        uuid: uuidv4(),
        userId: ctx.request.body.userId || ctx.req.decoded.uuid,
        smokedItems: ctx.request.body.smokedItems,
        quitBeforeStartAgain: ctx.request.body.quitBeforeStartAgain,
        entryStartDate: ctx.request.body.entryStartDate,
        smokeType: ctx.request.body.smokeType,
        notes: ctx.request.body.notes,
        managedStatus: ctx.request.body.managedStatus,
        status: 'InProgress',
        triedToQuitBefore: ctx.request.body.triedToQuitBefore,
        averageSpendPerWeek: ctx.request.body.averageSpendPerWeek,
      };

      const findResp = await dbService.findOne('smoke_timeline', {
        where: {
          status: { [Op.ne]: 'Inactive' },
          [Op.and]: [
            Sequelize.where(
              Sequelize.fn('date', Sequelize.col('entryStartDate')),
              '=',
              commonService.indiaTz(savePayload.entryStartDate).format('YYYY-MM-DD')
            ),
            {
              userId: savePayload.userId,
            },
          ],
        },
      });

      if (findResp) {
        ctx.res.conflict({ msg: responseMessages[1123] });
        return;
      }

      const saveResp = await dbService.create('smoke_timeline', savePayload, {});

      if (!saveResp) {
        ctx.res.forbidden({ msg: responseMessages[1128] });
        return;
      }

      ctx.res.ok({ result: saveResp });
      return;
    } catch (error) {
      console.log('\n quitting save error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getLatestQuitting: async (ctx) => {
    try {
      const findResp = await dbService.findOne('smoke_timeline', {
        order: [['entryStartDate', 'DESC']],
        where: { userId: ctx.request.query.userId || ctx.req.decoded.uuid, status: ctx.request.query.status },
      });

      if (!findResp) {
        ctx.res.notFound({ msg: responseMessages[1129] });
        return;
      }

      ctx.res.ok({ result: findResp });
      return;
    } catch (error) {
      console.log('\n Smoke Timeline find error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getList: async (ctx) => {
    try {
      const findQuery = {
        order: [['entryStartDate', 'DESC']],
        where: {
          [Op.and]: [
            {
              userId: ctx.request.query.userId || ctx.req.decoded.uuid,
            },
            {
              status: ctx.request.query.status || 'Ended',
            },
          ],
        },
      };

      if (ctx.request.query.uuid) {
        findQuery.where[Op.and].push({ uuid: ctx.request.query.uuid });
      }

      if (ctx.request.query.status) {
        findQuery.where[Op.and].push({ status: ctx.request.query.status });
      }

      if (ctx.request.query.entryStartDate) {
        findQuery.where[Op.and].push(
          Sequelize.where(
            Sequelize.fn('date', Sequelize.col('entryStartDate')),
            '=',
            commonService.indiaTz(ctx.request.query.entryStartDate).format('YYYY-MM-DD')
          )
        );
      }

      if (ctx.request.query.entryEndDate) {
        findQuery.where[Op.and].push(
          Sequelize.where(
            Sequelize.fn('date', Sequelize.col('entryEndDate')),
            '=',
            commonService.indiaTz(ctx.request.query.entryEndDate).format('YYYY-MM-DD')
          )
        );
      }

      const { count, rows } = await dbService.findAndCountAll('smoke_timeline', findQuery);

      ctx.res.ok({ result: rows, count });
      return;
    } catch (error) {
      console.log('\n Smoke Timeline find error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  addNoSmokeEntry: async (ctx) => {
    try {
      let findResp = await dbService.findOne('smoke_timeline', {
        where: {
          uuid: ctx.request.body.uuid,
          status: 'InProgress',
        },
      });

      if (!findResp) {
        ctx.res.notFound({ msg: responseMessages[1129] });
        return;
      }

      findResp = findResp.toJSON();

      let { noSmokeEntries } = findResp;
      if (noSmokeEntries && noSmokeEntries.length) {
        let idx = 0;
        let dateAlreadyExists = false;

        while (noSmokeEntries.length > idx) {
          dateAlreadyExists =
            moment(noSmokeEntries[idx]).format('YYYY-MM-DD') == moment(ctx.request.body.date).format('YYYY-MM-DD');
          if (dateAlreadyExists) {
            ctx.res.conflict({ msg: responseMessages[1124] });
            return;
          }
          idx++;
        }
      } else {
        noSmokeEntries = [];
      }

      noSmokeEntries.push(moment(ctx.request.body.date).toISOString());

      const updateResp = await dbService.update(
        'smoke_timeline',
        { noSmokeEntries },
        {
          where: {
            uuid: ctx.request.body.uuid,
          },
          individualHooks: true,
        },
        {}
      );

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1125] });
        return;
      }

      ctx.res.ok({ result: updateResp[0] });
      return;
    } catch (error) {
      console.log('\n Smoke Timeline find error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  toggleDailyReminder: async (ctx) => {
    try {
      let findResp = await dbService.findOne('smoke_timeline', {
        where: {
          uuid: ctx.request.body.uuid,
          status: 'InProgress',
        },
      });

      if (!findResp) {
        ctx.res.notFound({ msg: responseMessages[1129] });
        return;
      }

      findResp = findResp.toJSON();

      const updateResp = await dbService.update(
        'smoke_timeline',
        { dailyReminder: ctx.request.body.dailyReminder },
        {
          where: {
            uuid: ctx.request.body.uuid,
          },
          individualHooks: true,
        },
        {}
      );

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1126] });
        return;
      }

      ctx.res.ok({ result: updateResp[0] });
      return;
    } catch (error) {
      console.log('\n Smoke timeline reminder error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  dailyReminderUsers: async (ctx) => {
    try {
      const findResp = await dbService.findAll('smoke_timeline', {
        where: {
          dailyReminder: true,
          status: 'InProgress',
        },
        include: [
          {
            model: 'user',
            as: 'userInfo',
            attributes: ['uuid', 'username', 'email', 'mobileNumber', 'firstName', 'middleName', 'lastName'],
          },
        ],
      });

      ctx.res.ok({ result: findResp.map((innerData) => innerData.toJSON()) });
      return;
    } catch (error) {
      console.log('\n Smoke timeline reminder mail send error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  endQuitting: async (ctx) => {
    try {
      const updatePayload = {
        entryEndDate: ctx.request.body.entryEndDate,
        smokingTrigger: ctx.request.body.smokingTrigger,
        smokingTriggerOthers: ctx.request.body.smokingTriggerOthers,
        notes: ctx.request.body.notes,
        status: 'Ended',
      };

      const findResp = await dbService.findOne('smoke_timeline', {
        where: {
          uuid: ctx.request.body.uuid,
          status: 'InProgress',
        },
      });

      if (!findResp) {
        ctx.res.notFound({ msg: responseMessages[1129] });
        return;
      }
      if (!commonService.compareDates(findResp.entryStartDate, updatePayload.entryEndDate, 'lteq')) {
        ctx.res.unprocessableEntity({ msg: responseMessages[1130] });
        return;
      }

      const updateResp = await dbService.update(
        'smoke_timeline',
        updatePayload,
        { where: { uuid: ctx.request.body.uuid }, individualHooks: true },
        {}
      );

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1127] });
        return;
      }

      ctx.res.ok({ result: updateResp[0] });
      return;
    } catch (error) {
      console.log('\n Smoke Timeline find error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getFhirUnsavedList: async (ctx) => {
    try {
      const findQuery = {
        where: {
          fhirSynced: false,
        },
        include: [
          {
            model: 'user',
            as: 'userInfo',
            attributes: ['id', 'fhirId'],
          },
        ],
      };

      const findData = await dbService.findAll('smoke_timeline', findQuery);

      ctx.res.ok({ result: findData });
      return;
    } catch (error) {
      console.log('\n smoke_timeline find list error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  syncFhir: async (ctx) => {
    try {
      const updatePromise = _.filter(ctx.request.body.fhirSyncArray || [], (innerData) => !innerData.deleted).map(
        (innerData) =>
          dbService.update(
            'smoke_timeline',
            { fhirSynced: true, fhirId: innerData.fhirId },
            { where: { id: innerData.id } },
            {}
          )
      );

      const idsToDelete = _.filter(ctx.request.body.fhirSyncArray || [], (innerData) => innerData.deleted).map(
        (innerData) => innerData.id
      );

      const updateResp = await Promise.all(updatePromise);
      const deletedResp = await dbService.destroy('smoke_timeline', { where: { id: { [Op.in]: idsToDelete } } });

      ctx.res.ok({ result: { updateResp, deletedResp } });
      return;
    } catch (error) {
      console.log('\n smoke_timeline fhir sync update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
};
