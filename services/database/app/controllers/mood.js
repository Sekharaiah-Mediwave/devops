const commonService = require('../services/common-service');
const dbService = require('../services/db-service');
const { _, moment, uuidv4 } = require('../services/imports');
const { Sequelize } = require('../config/sequelize');

const { Op } = Sequelize;
const responseMessages = require('../middleware/response-messages');

module.exports = {
  async saveRecord(ctx) {
    try {
      const savePayload = {
        uuid: uuidv4(),
        userId: ctx.request.body.userId || ctx.req.decoded.uuid,
        entryDate: moment(ctx.request.body.entryDate).format('YYYY-MM-DD'),
        notes: ctx.request.body.notes,
        managedStatus: ctx.request.body.managedStatus,
        status: ctx.request.body.status,
        moodFace: ctx.request.body.moodFace,
      };

      const findResp = await dbService.findOne('mood', {
        where: {
          status: { [Op.ne]: 'Inactive' },
          userId: savePayload.userId,
          entryDate: {
            [Op.gte]: moment(savePayload.entryDate, 'YYYY-MM-DD').startOf('day').format(),
            [Op.lte]: moment(savePayload.entryDate, 'YYYY-MM-DD').endOf('day').format(),
          },
        },
      });

      if (findResp) {
        ctx.res.conflict({ msg: responseMessages[1094] });
        return;
      }

      const saveResp = await dbService.create('mood', savePayload, {});

      if (!saveResp) {
        ctx.res.forbidden({ msg: responseMessages[1097] });
        return;
      }

      ctx.res.ok({ result: saveResp });
      return;
    } catch (error) {
      console.log('\n mood save error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async getById(ctx) {
    try {
      const findResp = await dbService.findOne('mood', { where: { uuid: ctx.request.params.uuid, status: 'Active' } });

      if (!findResp) {
        ctx.res.notFound({ msg: responseMessages[1098] });
        return;
      }

      ctx.res.ok({ result: findResp });
      return;
    } catch (error) {
      console.log('\n mood find error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async getList(ctx) {
    try {
      const findQuery = {
        order: [['entryDate', 'DESC']],
        where: {
          [Op.and]: [
            {
              userId: ctx.request.query.userId || ctx.req.decoded.uuid,
            },
            {
              status: 'Active',
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

      if (ctx.request.query.entryDate) {
        findQuery.where[Op.and].push(
          Sequelize.where(
            Sequelize.fn('date', Sequelize.col('entryDate')),
            '=',
            commonService.indiaTz(ctx.request.query.entryDate).format('YYYY-MM-DD')
          )
        );
      }

      const { count, rows } = await dbService.findAndCountAll('mood', findQuery);

      if (!rows) {
        ctx.res.notFound({ msg: responseMessages[1098] });
        return;
      }

      ctx.res.ok({ result: rows, count });
      return;
    } catch (error) {
      console.log('\n mood find list error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async updateRecord(ctx) {
    try {
      const updatePayload = {
        userId: ctx.request.body.userId || ctx.req.decoded.uuid,
        entryDate: ctx.request.body.entryDate,
        notes: ctx.request.body.notes,
        managedStatus: ctx.request.body.managedStatus,
        status: ctx.request.body.status,
        moodFace: ctx.request.body.moodFace,
      };

      const findResp = await dbService.findOne('mood', {
        where: {
          entryDate: updatePayload.entryDate,
          status: { [Op.ne]: 'Inactive' },
          uuid: { [Op.not]: ctx.request.body.uuid },
        },
      });

      if (findResp) {
        ctx.res.conflict({ msg: responseMessages[1094] });
        return;
      }

      const updateResp = await dbService.update(
        'mood',
        updatePayload,
        { where: { uuid: ctx.request.body.uuid }, individualHooks: true },
        {}
      );

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1095] });
        return;
      }

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n mood update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async deleteRecord(ctx) {
    try {
      const updatePayload = {
        status: 'Inactive',
      };

      const updateResp = await dbService.update(
        'mood',
        updatePayload,
        { where: { uuid: ctx.request.query.uuid }, individualHooks: true },
        {}
      );

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1096] });
        return;
      }

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n mood delete error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getChartData: async (ctx) => {
    try {
      const findQuery = {
        attributes: ['moodFace', [Sequelize.literal('DATE("entryDate")'), 'date'], 'notes'],
        where: {
          [Op.and]: [
            {
              userId: ctx.request.query.userId || ctx.req.decoded.uuid,
            },
            {
              status: 'Active',
            },
            Sequelize.where(
              Sequelize.fn('date', Sequelize.col('entryDate')),
              '>=',
              commonService.indiaTz(ctx.request.query.fromDate).format('YYYY-MM-DD')
            ),
            Sequelize.where(
              Sequelize.fn('date', Sequelize.col('entryDate')),
              '<=',
              commonService.indiaTz(ctx.request.query.toDate).format('YYYY-MM-DD')
            ),
          ],
        },
      };

      let findResp = await dbService.findAll('mood', findQuery);
      findResp = findResp.map((findPatientData) => findPatientData.toJSON());

      let xValues = [];
      const yValues = [0, 0, 0, 0, 0, 0, 0];
      const notes = [null, null, null, null, null, null, null];
      const managedOverview = [];
      const totalUnits = 0;
      const totalManagedOverview = 0;
      let averageUnits = 0;
      let averageManagedOverview = 0;

      if (commonService.enumerateDaysBetweenDates(ctx.request.query.fromDate, ctx.request.query.toDate)) {
        xValues = commonService.enumerateDaysBetweenDates(ctx.request.query.fromDate, ctx.request.query.toDate);
      }
      if (findResp && findResp.length) {
        findResp.forEach((item) => {
          if (item.date) {
            const xvaluesIndex = _.findIndex(xValues, (o) => o == item.date);
            yValues[xvaluesIndex] = item.moodFace;
            notes[xvaluesIndex] = item.notes;
          }
        });
      }
      averageUnits =
        totalUnits / (moment(ctx.request.query.toDate).diff(moment(ctx.request.query.fromDate), 'days') + 1);
      averageManagedOverview =
        totalManagedOverview / (moment(ctx.request.query.toDate).diff(moment(ctx.request.query.fromDate), 'days') + 1);

      ctx.res.ok({
        result: {
          xValues: xValues.map((dateValue) => moment(dateValue).format('DD/MM (ddd)')),
          yValues,
          notes,
          totalUnits,
          average: { avgUnits: averageUnits, avgOverview: averageManagedOverview },
          managedOverview,
        },
      });
      return;
    } catch (error) {
      console.log('\n mood find list error...', error);
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
        attributes: { exclude: ['userId', 'createdAt', 'updatedAt'] },
      };
      const findResp = await dbService.findAll('mood', findQuery);

      ctx.res.ok({ result: findResp.map((innerData) => innerData.toJSON()) });
      return;
    } catch (error) {
      console.log('\n mood find list error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  syncFhir: async (ctx) => {
    try {
      const updatePromise = _.filter(ctx.request.body.fhirSyncArray || [], (innerData) => !innerData.deleted).map(
        (innerData) =>
          dbService.update('mood', { fhirSynced: true, fhirId: innerData.fhirId }, { where: { id: innerData.id } }, {})
      );

      const idsToDelete = _.filter(ctx.request.body.fhirSyncArray || [], (innerData) => innerData.deleted).map(
        (innerData) => innerData.id
      );

      const updateResp = await Promise.all(updatePromise);
      const deletedResp = await dbService.destroy('mood', { where: { id: { [Op.in]: idsToDelete } } });

      ctx.res.ok({ result: { updateResp, deletedResp } });
      return;
    } catch (error) {
      console.log('\n mood fhir sync update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
};
