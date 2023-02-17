const commonService = require('../services/common-service');
const dbService = require('../services/db-service');
const { _, moment, uuidv4 } = require('../services/imports');
const { Sequelize } = require('../config/sequelize');
const responseMessages = require('../middleware/response-messages');

const { Op } = Sequelize;

const getLastBmiInfo = async (userID) => {
  try {
    const findQuery = {
      order: [['entryDate', 'DESC']],
      where: {
        [Op.and]: [
          {
            userId: userID,
          },
        ],
      },
      attributes: { exclude: ['userId', 'createdAt', 'updatedAt', 'fhirSynced'] },
    };
    return await dbService.findAndCountAll('bmi', findQuery);
  } catch (error) {
    return {
      chart: 'bmi',
      message: 'error',
      err: error,
      status: 0,
    };
  }
};
module.exports = {
  getLastBmiInfo,
  async saveRecord(ctx) {
    try {
      const savePayload = {
        uuid: uuidv4(),
        userId: ctx.request.body.userId || ctx.req.decoded.uuid,
        entryDate: moment(ctx.request.body.entryDate).format('YYYY-MM-DD'),
        status: ctx.request.body.status,
        weight: ctx.request.body.weight,
        height: ctx.request.body.height,
      };
      const height = savePayload.height ? savePayload.height / 100 : 0;
      const weight = savePayload.weight ? savePayload.weight : 0;
      const bmi = weight / (height * height).toFixed(2);
      savePayload.bmi = bmi;
      const findResp = await dbService.findOne('bmi', {
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
        ctx.res.conflict({ msg: responseMessages[1053] });
        return;
      }

      const saveResp = await dbService.create('bmi', savePayload, {});

      if (!saveResp) {
        ctx.res.forbidden({ msg: responseMessages[1054] });
        return;
      }

      ctx.res.ok({ result: saveResp });
      return;
    } catch (error) {
      console.log('\n bmi save error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async getByUuid(ctx) {
    try {
      const findResp = await dbService.findOne('bmi', { where: { uuid: ctx.request.params.uuid, status: 'Active' } });

      if (!findResp) {
        ctx.res.notFound({ msg: responseMessages[1057] });
        return;
      }

      ctx.res.ok({ result: findResp });
      return;
    } catch (error) {
      console.log('\n bmi find error...', error);
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

      const { count, rows } = await dbService.findAndCountAll('bmi', findQuery);

      if (!rows) {
        ctx.res.notFound({ msg: responseMessages[1057] });
        return;
      }

      ctx.res.ok({ result: rows, count });
      return;
    } catch (error) {
      console.log('\n bmi find list error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async updateRecord(ctx) {
    try {
      const updatePayload = {
        userId: ctx.request.body.userId || ctx.req.decoded.uuid,
        entryDate: ctx.request.body.entryDate,
        status: ctx.request.body.status,
        weight: ctx.request.body.weight,
        height: ctx.request.body.height,
      };

      const findResp = await dbService.findOne('bmi', {
        where: {
          entryDate: updatePayload.entryDate,
          status: { [Op.ne]: 'Inactive' },
          uuid: { [Op.not]: ctx.request.body.uuid },
        },
      });

      if (findResp) {
        ctx.res.conflict({ msg: responseMessages[1053] });
        return;
      }

      const updateResp = await dbService.update(
        'bmi',
        updatePayload,
        { where: { uuid: ctx.request.body.uuid }, individualHooks: true },
        {}
      );

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1055] });
        return;
      }

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n bmi update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async deleteRecord(ctx) {
    try {
      const updatePayload = {
        status: 'Inactive',
      };

      const updateResp = await dbService.update(
        'bmi',
        updatePayload,
        { where: { uuid: ctx.request.query.uuid }, individualHooks: true },
        {}
      );

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1056] });
        return;
      }

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n bmi delete error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getChartData: async (ctx) => {
    try {
      const findQuery = {
        attributes: ['bmi', 'height', 'weight', [Sequelize.literal('DATE("entryDate")'), 'date']],
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

      let findResp = await dbService.findAll('bmi', findQuery);
      findResp = findResp.map((findPatientData) => findPatientData.toJSON());

      let xValues = [];
      let yValues = [];
      let height = [];
      let weight = [];
      let averageWeight = 0;
      let yearDashboardData = {};
      switch (ctx.request.query.type) {
        case 'week':
          [xValues, yValues, averageWeight, height, weight] = GraphCommon(
            ctx.request.query.fromDate,
            ctx.request.query.toDate,
            'week',
            findResp
          );
          break;
        case 'month':
          [xValues, yValues, averageWeight, height, weight] = GraphCommonMonth(ctx.request.query.fromDate, findResp);
          break;
        case 'year':
          yearDashboardData = commonService.getYearDashboardData(
            ctx.request.query.fromDate,
            findResp,
            'managedStatus',
            'managedStatus'
          );
          xValues = yearDashboardData.xValues;
          yValues = yearDashboardData.yValues;
          break;
      }

      ctx.res.ok({ result: { xValues, yValues, averageWeight, height, weight } });
      return;
    } catch (error) {
      console.log('\n BMI graph find list error...', error);
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
      const findResp = await dbService.findAll('bmi', findQuery);

      ctx.res.ok({ result: findResp.map((innerData) => innerData.toJSON()) });
      return;
    } catch (error) {
      console.log('\n bmi find list error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  syncFhir: async (ctx) => {
    try {
      const updatePromise = _.filter(ctx.request.body.fhirSyncArray || [], (innerData) => !innerData.deleted).map(
        (innerData) =>
          dbService.update('bmi', { fhirSynced: true, fhirId: innerData.fhirId }, { where: { id: innerData.id } }, {})
      );

      const idsToDelete = _.filter(ctx.request.body.fhirSyncArray || [], (innerData) => innerData.deleted).map(
        (innerData) => innerData.id
      );

      const updateResp = await Promise.all(updatePromise);
      const deletedResp = await dbService.destroy('bmi', { where: { id: { [Op.in]: idsToDelete } } });

      ctx.res.ok({ result: { updateResp, deletedResp } });
      return;
    } catch (error) {
      console.log('\n bmi fhir sync update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async getLastEntry(ctx) {
    try {
      const findResp = await dbService.findOne('bmi', {
        order: [['entryDate', 'DESC']],
        where: {
          userId: ctx.req.decoded.uuid,
        },
      });

      if (!findResp) {
        ctx.res.notFound({ msg: responseMessages[1057] });
        return;
      }

      ctx.res.ok({ result: findResp });
      return;
    } catch (error) {
      console.log('\n bmi find error...', error);
      ctx.res.internalServerError({ error });
    }
  },
};

function GraphCommon(fromDate, toDate, type, findResp) {
  let xValues = [];
  let yValues = [];
  const height = [0, 0, 0, 0, 0, 0, 0];
  const weight = [0, 0, 0, 0, 0, 0, 0];
  let averageWeight = 0;
  let daysHavingRecords = 0;
  xValues = commonService.enumerateDaysBetweenDates(fromDate, toDate);
  yValues = [0, 0, 0, 0, 0, 0, 0];
  if (findResp && findResp.length) {
    findResp.forEach((item) => {
      if (item.date) {
        const xvaluesIndex = _.findIndex(xValues, (o) => o == item.date);
        if (xvaluesIndex != -1) {
          daysHavingRecords++;
          yValues[xvaluesIndex] = commonService.roundDecimal(item.bmi || 0);
          height[xvaluesIndex] = commonService.roundDecimal(item.height || 0);
          weight[xvaluesIndex] = commonService.roundDecimal(item.weight || 0);
        }
      }
    });
  }
  if (type === 'week') {
    xValues = xValues.map((item) => moment(item).format('DD/MM (ddd)'));
    const reducer = (accumulator, currentValue) => accumulator + currentValue;
    averageWeight = commonService.roundDecimal(yValues.reduce(reducer) / daysHavingRecords);
    return [xValues, yValues, averageWeight, height, weight];
  }
}

function GraphCommonMonth(date, findResp) {
  let xValues = [];
  let yValues = [];
  let bmi = [];
  let averageWeight = 0;
  const averageWeightData = [];
  let height = [];
  let weight = [];
  const daysHavingRecords = [];
  const monthValues = commonService.getAllWeeksFromMonth(date);
  xValues = monthValues.weeksArr;
  if (findResp && findResp.length) {
    monthValues.weeksNumArr.forEach((monthDate) => {
      const weeksData = weekBasedData(monthDate.start, monthDate.end, findResp, 'bmi');
      bmi.push(weeksData.bmi);
      height.push(weeksData.height);
      weight.push(weeksData.weight);
      daysHavingRecords.push(weeksData.daysHavingRecords);
    });

    findResp.forEach((item) => {
      if (item.bmi) {
        averageWeightData.push(item.bmi);
      }
    });
  }
  const reducer = (accumulator, currentValue) => accumulator + currentValue;
  let yValueTotalCount;
  if (bmi.length > 0) {
    yValueTotalCount = bmi.map((item) => item.reduce(reducer) || 0).reduce(reducer);
  }
  bmi = bmi.map((item, idx) => commonService.roundDecimal(item.reduce(reducer) / daysHavingRecords[idx] || 0));
  height = height.map((item, idx) => commonService.roundDecimal(item.reduce(reducer) / daysHavingRecords[idx] || 0));
  weight = weight.map((item, idx) => commonService.roundDecimal(item.reduce(reducer) / daysHavingRecords[idx] || 0));
  yValues = bmi;
  console.log('\n daysHavingRecords...', daysHavingRecords);
  if (yValues && yValues.length) {
    averageWeight = commonService.roundDecimal(yValueTotalCount / daysHavingRecords.reduce(reducer));
  }
  return [xValues, yValues, averageWeight, height, weight];
}

function weekBasedData(fromDate, toDate, findResp) {
  const weekDates = commonService.enumerateDaysBetweenDates(fromDate, toDate);
  const bmi = [0, 0, 0, 0, 0, 0, 0];
  const height = [0, 0, 0, 0, 0, 0, 0];
  const weight = [0, 0, 0, 0, 0, 0, 0];
  let daysHavingRecords = 0;
  if (findResp && findResp.length) {
    findResp.forEach((item) => {
      if (item.date) {
        const xvaluesIndex = _.findIndex(weekDates, (o) => o == item.date);
        if (xvaluesIndex != -1) {
          daysHavingRecords++;
          bmi[xvaluesIndex] = item.bmi || 0;
          height[xvaluesIndex] = item.height || 0;
          weight[xvaluesIndex] = item.weight || 0;
        }
      }
    });
  }
  return { bmi, height, weight, daysHavingRecords };
}
