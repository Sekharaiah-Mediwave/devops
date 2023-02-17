const commonService = require('../services/common-service');
const dbService = require('../services/db-service');
const { _, moment, uuidv4 } = require('../services/imports');
const { Sequelize } = require('../config/sequelize');
const diary = require('./diary');
const responseMessages = require('../middleware/response-messages');

const { Op } = Sequelize;

const findChartRecords = async (fromDate, toDate, userId) => {
  try {
    const findQuery = {
      attributes: ['managedStatus', 'drinkedItems', [Sequelize.literal('DATE("entryDate")'), 'date']],
      where: {
        [Op.and]: [
          {
            userId,
          },
          {
            status: 'Active',
          },
          Sequelize.where(
            Sequelize.fn('date', Sequelize.col('entryDate')),
            '>=',
            commonService.indiaTz(fromDate).format('YYYY-MM-DD')
          ),
          Sequelize.where(
            Sequelize.fn('date', Sequelize.col('entryDate')),
            '<=',
            commonService.indiaTz(toDate).format('YYYY-MM-DD')
          ),
        ],
      },
    };

    const findResp = await dbService.findAll('alcohol', findQuery);

    return {
      chart: 'alcohol',
      result: findResp.map((findPatientData) => findPatientData.toJSON()),
    };
  } catch (error) {
    return {
      chart: 'alcohol',
      result: [],
    };
  }
};

const getChartDataFunc = async (type, fromDate, toDate, userId) => {
  try {
    const { result } = await findChartRecords(fromDate, toDate, userId);

    let xValues = [];
    let yValues = [];
    let managedOverview = [];
    let total = 0;
    let totalManagedOverview = 0;
    let averageUnits = 0;
    let averageManagedOverview = 0;
    let daysHavingRecords = 0;
    // const totalDays = (moment(toDate).diff(moment(fromDate), 'days') + 1);

    switch (type) {
      case 'week':
        ({ xValues, yValues, total, totalManagedOverview, managedOverview, daysHavingRecords } =
          commonService.getWeeksDashboardData(fromDate, toDate, result, 'drinkedItems', 'managedStatus'));

        break;
      case 'month':
        ({ xValues, yValues, total, totalManagedOverview, managedOverview, daysHavingRecords } =
          commonService.getMonthsDashboardData(fromDate, result, 'drinkedItems', 'managedStatus'));
        break;
      case 'year':
        ({ xValues, yValues, total, totalManagedOverview, managedOverview, daysHavingRecords } =
          commonService.getYearDashboardData(fromDate, result, 'drinkedItems', 'managedStatus'));
        // averageUnits = commonService.roundDecimal(total / totalDays);
        // averageManagedOverview = commonService.roundDecimal(totalManagedOverview / totalDays);
        break;
    }

    averageUnits = commonService.roundDecimal(total / daysHavingRecords);
    averageManagedOverview = commonService.roundDecimal(totalManagedOverview / daysHavingRecords);

    return {
      status: 1,
      msg: 'success',
      chart: 'alcohol',
      result: {
        xValues,
        yValues,
        totalUnits: total,
        average: { avgUnits: averageUnits, avgOverview: averageManagedOverview },
        managedOverview,
        daysHavingRecords,
      },
    };
  } catch (error) {
    console.log('\n alcohol chart find error...', error);
    return {
      chart: 'alcohol',
      msg: 'error',
      error,
      status: 0,
    };
  }
};
const getLastAlcoholInfo = async (userID) => {
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
    const findResp = await dbService.findAndCountAll('alcohol', findQuery);

    findResp.totalUnits = findResp.rows.length ? commonService.sumValuesInObject(findResp.rows[0].drinkedItems) : 0;
    return { ...findResp };
  } catch (error) {
    return {
      chart: 'alcohol',
      message: 'error',
      err: error,
      status: 0,
    };
  }
};
module.exports = {
  getChartDataFunc,
  getLastAlcoholInfo,
  findChartRecords,
  saveRecord: async (ctx) => {
    try {
      const savePayload = {
        uuid: uuidv4(),
        userId: ctx.request.body.userId || ctx.req.decoded.uuid,
        drinkedItems: ctx.request.body.drinkedItems,
        entryDate: ctx.request.body.entryDate,
        sessionTime: ctx.request.body.sessionTime,
        notes: ctx.request.body.notes,
        managedStatus: ctx.request.body.managedStatus,
        status: ctx.request.body.status,
      };

      const findResp = await dbService.findOne('alcohol', {
        where: {
          status: { [Op.ne]: 'Inactive' },
          [Op.and]: [
            Sequelize.where(
              Sequelize.fn('date', Sequelize.col('entryDate')),
              '=',
              commonService.indiaTz(savePayload.entryDate).format('YYYY-MM-DD')
            ),
            {
              userId: savePayload.userId,
            },
          ],
        },
      });

      if (findResp) {
        ctx.res.conflict({ msg: responseMessages[1024] });
        return;
      }

      const saveResp = await dbService.create('alcohol', savePayload, {});

      if (!saveResp) {
        ctx.res.forbidden({ msg: responseMessages[1025] });
        return;
      }

      if (ctx.request.body.add_to_diary) {
        await diary.saveDiaryRecord({
          uuid: uuidv4(),
          userId: ctx.request.body.userId || ctx.req.decoded.uuid,
          entryDate: moment(ctx.request.body.entryDate).format('YYYY-MM-DD'),
          status: 'Active',
          notes: '',
          createdFrom: 'alcohol',
          alcoholId: saveResp.uuid,
        });
      }

      ctx.res.ok({ result: saveResp });
      return;
    } catch (error) {
      console.log('\n alcohol save error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  updateRecord: async (ctx) => {
    try {
      const updatePayload = {
        userId: ctx.request.body.userId || ctx.req.decoded.uuid,
        drinkedItems: ctx.request.body.drinkedItems,
        entryDate: ctx.request.body.entryDate,
        sessionTime: ctx.request.body.sessionTime,
        notes: ctx.request.body.notes,
        managedStatus: ctx.request.body.managedStatus,
        status: ctx.request.body.status,
      };

      const findResp = await dbService.findOne('alcohol', {
        where: {
          [Op.and]: [
            Sequelize.where(
              Sequelize.fn('date', Sequelize.col('entryDate')),
              '=',
              commonService.indiaTz(updatePayload.entryDate).format('YYYY-MM-DD')
            ),
            {
              userId: updatePayload.userId,
            },
            {
              status: { [Op.ne]: 'Inactive' },
            },
            {
              uuid: { [Op.not]: ctx.request.body.uuid },
            },
          ],
        },
      });

      if (findResp) {
        ctx.res.conflict({ msg: responseMessages[1024] });
        return;
      }

      const updateResp = await dbService.update(
        'alcohol',
        updatePayload,
        { where: { uuid: ctx.request.body.uuid }, individualHooks: true },
        {}
      );

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1026] });
        return;
      }

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n alcohol update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  toggleArchiveRecord: async (ctx) => {
    try {
      const updatePayload = {
        status: ctx.request.body.status,
      };

      const updateResp = await dbService.update(
        'alcohol',
        updatePayload,
        { where: { uuid: ctx.request.body.uuids }, individualHooks: true },
        {}
      );

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1026] });
        return;
      }

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n alcohol update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  deleteRecord: async (ctx) => {
    try {
      const updatePayload = {
        status: 'Inactive',
      };

      const updateResp = await dbService.update(
        'alcohol',
        updatePayload,
        { where: { uuid: ctx.request.query.uuid }, individualHooks: true },
        {}
      );

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1027] });
        return;
      }
      await diary.deleteTrackerRecord({ where: { alcoholId: updateResp[1][0].uuid }, individualHooks: true });

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n alcohol delete error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getById: async (ctx) => {
    try {
      let findResp = await dbService.findOne('alcohol', { where: { uuid: ctx.request.params.uuid, status: 'Active' } });

      if (!findResp) {
        ctx.res.notFound({ msg: responseMessages[1028] });
        return;
      }

      findResp = findResp.toJSON();

      ctx.res.ok({ result: { ...findResp, totalUnits: commonService.sumValuesInObject(findResp.drinkedItems) } });
      return;
    } catch (error) {
      console.log('\n alcohol find error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getList: async (ctx) => {
    try {
      const findQuery = {
        order: [['entryDate', 'DESC']],
        where: {
          [Op.and]: [
            {
              userId: ctx.request.query.userId || ctx.req.decoded.uuid,
            },
          ],
        },
      };

      if (ctx.request.query.status) {
        findQuery.where[Op.and].push({ status: ctx.request.query.status });
      } else {
        findQuery.where[Op.and].push({
          [Op.or]: [{ status: 'Active' }, { status: 'Archived' }],
        });
      }

      if (ctx.request.query.uuid) {
        findQuery.where[Op.and].push({ uuid: ctx.request.query.uuid });
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

      if (ctx.request.query.fromDate) {
        findQuery.where[Op.and].push({
          entryDate: { [Op.gte]: commonService.indiaTz(ctx.request.query.fromDate).startOf('day') },
        });
      }

      if (ctx.request.query.toDate) {
        findQuery.where[Op.and].push({
          entryDate: { [Op.lte]: commonService.indiaTz(ctx.request.query.toDate).endOf('day') },
        });
      }

      const { count, rows } = await dbService.findAndCountAll('alcohol', findQuery);

      if (!rows) {
        ctx.res.notFound({ msg: responseMessages[1028] });
        return;
      }

      ctx.res.ok({
        result: rows
          .map((findData) => findData.toJSON())
          .map((innerData) => ({ ...innerData, totalUnits: commonService.sumValuesInObject(innerData.drinkedItems) })),
        count,
      });
      return;
    } catch (error) {
      console.log('\n alcohol find list error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getChartData: async (ctx) => {
    try {
      const chartDataResp = await getChartDataFunc(
        ctx.request.query.type,
        ctx.request.query.fromDate,
        ctx.request.query.toDate,
        ctx.request.query.userId || ctx.req.decoded.uuid
      );
      if (chartDataResp.status) {
        ctx.res.ok({ ...chartDataResp });
      } else {
        ctx.res.internalServerError({ ...chartDataResp });
      }
      return;
    } catch (error) {
      console.log('\n alcohol find list error...', error);
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

      const findData = await dbService.findAll('alcohol', findQuery);

      ctx.res.ok({ result: findData.map((innerData) => innerData.toJSON()) });
      return;
    } catch (error) {
      console.log('\n alcohol find list error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  syncFhir: async (ctx) => {
    try {
      const updatePromise = _.filter(ctx.request.body.fhirSyncArray || [], (innerData) => !innerData.deleted).map(
        (innerData) =>
          dbService.update(
            'alcohol',
            { fhirSynced: true, fhirId: innerData.fhirId },
            { where: { id: innerData.id } },
            {}
          )
      );

      const idsToDelete = _.filter(ctx.request.body.fhirSyncArray || [], (innerData) => innerData.deleted).map(
        (innerData) => innerData.id
      );

      const updateResp = await Promise.all(updatePromise);
      const deletedResp = await dbService.destroy('alcohol', { where: { id: { [Op.in]: idsToDelete } } });

      ctx.res.ok({ result: { updateResp, deletedResp } });
      return;
    } catch (error) {
      console.log('\n alcohol fhir sync update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
};
