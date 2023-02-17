const commonService = require('../services/common-service');
const dbService = require('../services/db-service');
const { Sequelize } = require('../config/sequelize');
const { moment, _, uuidv4 } = require('../services/imports');

const { Op } = Sequelize;
const responseMessages = require('../middleware/response-messages');

module.exports = {
  async createTemperature(ctx) {
    try {
      const savePayload = {
        uuid: uuidv4(),
        userId: ctx.request.body.userId || ctx.req.decoded.uuid,
        bodyTemperature: ctx.request.body.bodyTemperature,
        date: ctx.request.body.date,
      };

      const findQuery = {
        where: {
          status: { [Op.ne]: 'Inactive' },
          userId: savePayload.userId,
          date: {
            [Op.gte]: moment(savePayload.date, 'YYYY-MM-DD').startOf('day').format(),
            [Op.lte]: moment(savePayload.date, 'YYYY-MM-DD').endOf('day').format(),
          },
        },
      };
      const rows = await dbService.findOne('temperature', findQuery);

      if (rows) {
        ctx.res.conflict({ msg: responseMessages[1136] });
        return;
      }
      const saveResp = await dbService.create('temperature', savePayload, {});

      if (!saveResp) {
        ctx.res.forbidden({ msg: responseMessages[1139] });
        return;
      }

      ctx.res.ok({ result: saveResp });
      return;
    } catch (error) {
      console.log('\n Temperature save error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async getAllTemperature(ctx) {
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

      if (ctx.request.query.date) {
        findQuery.where[Op.and].push(
          Sequelize.where(
            Sequelize.fn('date', Sequelize.col('entryDate')),
            '=',
            commonService.indiaTz(ctx.request.query.entryDate).format('YYYY-MM-DD')
          )
        );
      }

      const { count, rows } = await dbService.findAndCountAll('temperature', findQuery);

      if (!rows) {
        ctx.res.notFound({ msg: responseMessages[1140] });
        return;
      }

      ctx.res.ok({ result: rows, count });
      return;
    } catch (error) {
      console.log('\n temperature find list error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async getByUuid(ctx) {
    try {
      const findResp = await dbService.findOne('temperature', {
        where: { uuid: ctx.request.params.uuid, status: 'Active' },
      });

      if (!findResp) {
        ctx.res.notFound({ msg: responseMessages[1140] });
        return;
      }

      ctx.res.ok({ result: findResp });
      return;
    } catch (error) {
      console.log('\n temperature find error...', error);
      ctx.res.internalServerError({ error });
    }
  },

  async updateRecord(ctx) {
    try {
      const updatePayload = {
        userId: ctx.request.body.userId || ctx.req.decoded.uuid,
        date: ctx.request.body.date,
        bodyTemperature: ctx.request.body.bodyTemperature,
      };

      const findResp = await dbService.findOne('temperature', {
        where: {
          date: updatePayload.date,
          status: { [Op.ne]: 'Inactive' },
          uuid: { [Op.not]: ctx.request.body.uuid },
        },
      });

      if (findResp) {
        ctx.res.conflict({ msg: responseMessages[1136] });
        return;
      }

      const updateResp = await dbService.update(
        'temperature',
        updatePayload,
        { where: { uuid: ctx.request.body.uuid }, individualHooks: true },
        {}
      );

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1137] });
        return;
      }

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n temperature update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async deleteRecord(ctx) {
    try {
      const updatePayload = {
        status: 'Inactive',
      };

      const updateResp = await dbService.update('temperature', updatePayload, {
        where: { uuid: ctx.request.query.uuid },
        individualHooks: true,
      });

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1138] });
        return;
      }

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n temperature delete error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getChartData: async (ctx) => {
    try {
      const findQuery = {
        attributes: ['bodyTemperature', [Sequelize.literal('DATE("date")'), 'date']],
        where: {
          [Op.and]: [
            {
              userId: ctx.request.query.userId || ctx.req.decoded.uuid,
            },
            {
              status: 'Active',
            },
            Sequelize.where(
              Sequelize.fn('date', Sequelize.col('date')),
              '>=',
              commonService.indiaTz(ctx.request.query.fromDate).format('YYYY-MM-DD')
            ),
            Sequelize.where(
              Sequelize.fn('date', Sequelize.col('date')),
              '<=',
              commonService.indiaTz(ctx.request.query.toDate).format('YYYY-MM-DD')
            ),
          ],
        },
      };

      let findResp = await dbService.findAll('temperature', findQuery);
      findResp = findResp.map((findPatientData) => findPatientData.toJSON());

      let xValues = [];
      const yValues = [0, 0, 0, 0, 0, 0, 0];

      if (commonService.enumerateDaysBetweenDates(ctx.request.query.fromDate, ctx.request.query.toDate)) {
        xValues = commonService.enumerateDaysBetweenDates(ctx.request.query.fromDate, ctx.request.query.toDate);
      }
      if (findResp && findResp.length) {
        findResp.forEach((item) => {
          if (item.date) {
            const xvaluesIndex = _.findIndex(xValues, (o) => o == item.date);
            yValues[xvaluesIndex] = item.bodyTemperature;
          }
        });
      }

      ctx.res.ok({
        result: {
          xValues: xValues.map((dateValue) => moment(dateValue).format('DD/MM (ddd)')),
          yValues,
        },
      });
      return;
    } catch (error) {
      console.log('\n temperature find list error...', error);
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
      const findResp = await dbService.findAll('temperature', findQuery);

      ctx.res.ok({ result: findResp.map((innerData) => innerData.toJSON()) });
      return;
    } catch (error) {
      console.log('\n temperature find list error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  syncFhir: async (ctx) => {
    try {
      const updatePromise = _.filter(ctx.request.body.fhirSyncArray || [], (innerData) => !innerData.deleted).map(
        (innerData) =>
          dbService.update(
            'temperature',
            { fhirSynced: true, fhirId: innerData.fhirId },
            { where: { id: innerData.id } },
            {}
          )
      );

      const idsToDelete = _.filter(ctx.request.body.fhirSyncArray || [], (innerData) => innerData.deleted).map(
        (innerData) => innerData.id
      );

      const updateResp = await Promise.all(updatePromise);
      const deletedResp = await dbService.destroy('temperature', { where: { id: { [Op.in]: idsToDelete } } });

      ctx.res.ok({ result: { updateResp, deletedResp } });
      return;
    } catch (error) {
      console.log('\n temperature fhir sync update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
};
