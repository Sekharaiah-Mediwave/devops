const commonService = require('../services/common-service');
const dbService = require('../services/db-service');
const { _, moment, uuidv4 } = require('../services/imports');
const { Sequelize } = require('../config/sequelize');
const responseMessages = require('../middleware/response-messages');

const { Op } = Sequelize;

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
        heartRate: ctx.request.body.heartRate,
        diastolicBloodPressure: ctx.request.body.diastolicBloodPressure,
        systolicBloodPressure: ctx.request.body.systolicBloodPressure,
      };

      const findResp = await dbService.findOne('blood', {
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
        ctx.res.conflict({ msg: responseMessages[1048] });
        return;
      }

      const saveResp = await dbService.create('blood', savePayload, {});

      if (!saveResp) {
        ctx.res.forbidden({ msg: responseMessages[1049] });
        return;
      }

      ctx.res.ok({ result: saveResp });
      return;
    } catch (error) {
      console.log('\n blood pressure save error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async getByUuid(ctx) {
    try {
      const findResp = await dbService.findOne('blood', {
        where: { uuid: ctx.request.params.uuid, status: 'Active' },
      });

      if (!findResp) {
        ctx.res.notFound({ msg: responseMessages[1050] });
        return;
      }

      ctx.res.ok({ result: findResp });
      return;
    } catch (error) {
      console.log('\n blood pressure find error...', error);
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

      const { count, rows } = await dbService.findAndCountAll('blood', findQuery);

      if (!rows) {
        ctx.res.notFound({ msg: responseMessages[1050] });
        return;
      }

      ctx.res.ok({ result: rows, count });
      return;
    } catch (error) {
      console.log('\n blood find list error...', error);
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
        heartRate: ctx.request.body.heartRate,
        diastolicBloodPressure: ctx.request.body.diastolicBloodPressure,
        systolicBloodPressure: ctx.request.body.systolicBloodPressure,
      };

      const findResp = await dbService.findOne('blood', {
        where: {
          entryDate: updatePayload.entryDate,
          uuid: { [Op.not]: ctx.request.body.uuid },
          status: { [Op.ne]: 'Inactive' },
        },
      });

      if (findResp) {
        ctx.res.conflict({ msg: responseMessages[1048] });
        return;
      }

      const updateResp = await dbService.update(
        'blood',
        updatePayload,
        { where: { uuid: ctx.request.body.uuid }, individualHooks: true },
        {}
      );

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1051] });
        return;
      }

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n blood update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async deleteRecord(ctx) {
    try {
      const updatePayload = {
        status: 'Inactive',
      };

      const updateResp = await dbService.update(
        'blood',
        updatePayload,
        { where: { uuid: ctx.request.query.uuid }, individualHooks: true },
        {}
      );

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1052] });
        return;
      }

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n blood delete error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getChartData: async (ctx) => {
    try {
      const findQuery = {
        attributes: [
          'heartRate',
          'diastolicBloodPressure',
          'systolicBloodPressure',
          [Sequelize.literal('DATE("entryDate")'), 'date'],
          'createdAt',
        ],
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

      let findResp = await dbService.findAll('blood', findQuery);
      findResp = findResp.map((findPatientData) => findPatientData.toJSON());

      let xValues = [];
      let yValues = [];
      const DiastolicDataValues = [null, null, null, null, null, null, null];
      const SystolicDataValues = [null, null, null, null, null, null, null];
      if (commonService.enumerateDaysBetweenDates(ctx.request.query.fromDate, ctx.request.query.toDate)) {
        xValues = commonService.getAllDates(ctx.request.query.fromDate, ctx.request.query.toDate, 'week');
      }

      if (findResp && findResp.length) {
        findResp.forEach((item) => {
          if (item.date) {
            const xvaluesIndex = _.findIndex(xValues, (o) => o == item.date);
            DiastolicDataValues[xvaluesIndex] = item.diastolicBloodPressure;
            SystolicDataValues[xvaluesIndex] = item.systolicBloodPressure;
          }
        });
        yValues = [
          { name: 'Diastolic', data: DiastolicDataValues },
          { name: 'Systolic', data: SystolicDataValues },
        ];
      } else {
        yValues = [
          { name: 'Diastolic', data: DiastolicDataValues },
          { name: 'Systolic', data: SystolicDataValues },
        ];
      }

      ctx.res.ok({
        result: {
          xValues: xValues.map((dateValue) => moment(dateValue).format('DD/MM (ddd)')),
          yValues,
        },
      });
      return;
    } catch (error) {
      console.log('\n blood find list error...', error);
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
      const findResp = await dbService.findAll('blood', findQuery);

      ctx.res.ok({ result: findResp.map((innerData) => innerData.toJSON()) });
      return;
    } catch (error) {
      console.log('\n blood find list error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  syncFhir: async (ctx) => {
    try {
      const updatePromise = _.filter(ctx.request.body.fhirSyncArray || [], (innerData) => !innerData.deleted).map(
        (innerData) =>
          dbService.update('blood', { fhirSynced: true, fhirId: innerData.fhirId }, { where: { id: innerData.id } }, {})
      );

      const idsToDelete = _.filter(ctx.request.body.fhirSyncArray || [], (innerData) => innerData.deleted).map(
        (innerData) => innerData.id
      );

      const updateResp = await Promise.all(updatePromise);
      const deletedResp = await dbService.destroy('blood', { where: { id: { [Op.in]: idsToDelete } } });

      ctx.res.ok({ result: { updateResp, deletedResp } });
      return;
    } catch (error) {
      console.log('\n blood fhir sync update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
};
