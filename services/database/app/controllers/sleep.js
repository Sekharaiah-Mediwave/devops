const commonService = require('../services/common-service');
const dbService = require('../services/db-service');
const { _, moment, uuidv4 } = require('../services/imports');
const { Sequelize } = require('../config/sequelize');
const diary = require('./diary');

const { Op } = Sequelize;
const responseMessages = require('../middleware/response-messages');

const findChartRecords = async (fromDate, toDate, userId) => {
  try {
    const findQuery = {
      attributes: ['fromTime', 'toTime', 'wakeup', 'managedStatus', [Sequelize.literal('DATE("entryDate")'), 'date']],
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

    const findResp = await dbService.findAll('sleep', findQuery);

    return {
      chart: 'sleep',
      result: findResp.map((findPatientData) => findPatientData.toJSON()),
    };
  } catch (error) {
    return {
      chart: 'sleep',
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
    let averageManagedOverview = 0;
    let averageSleepInterrupted = 0;
    let averageSleepDuration = 0;
    let daysHavingRecords = 0;
    let sleepInterrupted = 0;
    // const totalDays = (moment(toDate).diff(moment(fromDate), 'days') + 1);

    switch (type) {
      case 'week':
        ({ xValues, yValues, total, totalManagedOverview, managedOverview, daysHavingRecords, sleepInterrupted } =
          getWeeksDashboardData(fromDate, toDate, result));
        break;
      case 'month':
        ({ xValues, yValues, total, totalManagedOverview, managedOverview, daysHavingRecords, sleepInterrupted } =
          getMonthsDashboardData(fromDate, result));
        break;
      case 'year':
        ({ xValues, yValues, total, totalManagedOverview, managedOverview, daysHavingRecords, sleepInterrupted } =
          getYearDashboardData(fromDate, result));
        break;
    }

    averageManagedOverview = commonService.roundDecimal(totalManagedOverview / daysHavingRecords);
    averageSleepInterrupted = commonService.roundDecimal(sleepInterrupted / daysHavingRecords);
    averageSleepDuration = commonService.roundDecimal(total / daysHavingRecords);

    return {
      chart: 'sleep',
      status: 1,
      msg: 'success',
      result: {
        xValues,
        yValues,
        totalSleep: total,
        average: {
          avgOverview: averageManagedOverview,
          avgSleepInterrupted: averageSleepInterrupted,
          avgSleepDuration: averageSleepDuration,
        },
        managedOverview,
        daysHavingRecords,
        totalSleepInterrupted: sleepInterrupted,
      },
    };
  } catch (error) {
    console.log('\n sleep find list error...', error);
    return {
      chart: 'sleep',
      message: 'error',
      error,
      status: 0,
    };
  }
};

module.exports = {
  getChartDataFunc,
  findChartRecords,
  saveRecord: async (ctx) => {
    try {
      if (ctx.request.body.sleepInterrupted != ctx.request.body.wakeup.length) {
        ctx.res.conflict({ msg: responseMessages[1117] });
        return;
      }
      const savePayload = {
        uuid: uuidv4(),
        userId: ctx.request.body.userId || ctx.req.decoded.uuid,
        wakeup: ctx.request.body.wakeup,
        entryDate: ctx.request.body.entryDate,
        duration: ctx.request.body.duration,
        fromTime: ctx.request.body.fromTime,
        toTime: ctx.request.body.toTime,
        notes: ctx.request.body.notes,
        sleepInterrupted: ctx.request.body.sleepInterrupted,
        managedStatus: ctx.request.body.managedStatus,
        status: ctx.request.body.status,
      };

      const findResp = await dbService.findOne('sleep', {
        where: {
          [Op.and]: [
            Sequelize.where(
              Sequelize.fn('date', Sequelize.col('entryDate')),
              '=',
              commonService.indiaTz(savePayload.entryDate).format('YYYY-MM-DD')
            ),
            {
              userId: savePayload.userId,
            },
            {
              status: { [Op.ne]: 'Inactive' },
            },
          ],
        },
      });

      if (findResp) {
        ctx.res.conflict({ msg: responseMessages[1118] });
        return;
      }

      const saveResp = await dbService.create('sleep', savePayload, {});

      if (!saveResp) {
        ctx.res.forbidden({ msg: responseMessages[1119] });
        return;
      }

      if (ctx.request.body.add_to_diary) {
        await diary.saveDiaryRecord({
          uuid: uuidv4(),
          userId: ctx.request.body.userId || ctx.req.decoded.uuid,
          entryDate: moment(ctx.request.body.entryDate).format('YYYY-MM-DD'),
          status: 'Active',
          notes: '',
          createdFrom: 'sleep',
          sleepId: saveResp.uuid,
        });
      }

      ctx.res.ok({ result: saveResp });
      return;
    } catch (error) {
      console.log('\n sleep save error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  updateRecord: async (ctx) => {
    try {
      const updatePayload = {
        userId: ctx.request.body.userId || ctx.req.decoded.uuid,
        wakeup: ctx.request.body.wakeup,
        entryDate: ctx.request.body.entryDate,
        duration: ctx.request.body.duration,
        fromTime: ctx.request.body.fromTime,
        toTime: ctx.request.body.toTime,
        notes: ctx.request.body.notes,
        sleepInterrupted: ctx.request.body.sleepInterrupted,
        managedStatus: ctx.request.body.managedStatus,
        status: ctx.request.body.status,
      };

      const findResp = await dbService.findOne('sleep', {
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
        ctx.res.conflict({ msg: responseMessages[1118] });
        return;
      }

      const updateResp = await dbService.update(
        'sleep',
        updatePayload,
        { where: { uuid: ctx.request.body.uuid }, individualHooks: true },
        {}
      );

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1120] });
        return;
      }

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n sleep update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  toggleArchiveRecord: async (ctx) => {
    try {
      const updatePayload = {
        status: ctx.request.body.status,
      };

      const updateResp = await dbService.update(
        'sleep',
        updatePayload,
        { where: { uuid: ctx.request.body.uuids }, individualHooks: true },
        {}
      );

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1120] });
        return;
      }

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n sleep update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  deleteRecord: async (ctx) => {
    try {
      const updatePayload = {
        status: 'Inactive',
      };

      const updateResp = await dbService.update(
        'sleep',
        updatePayload,
        { where: { uuid: ctx.request.query.uuid }, individualHooks: true },
        {}
      );

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1121] });
        return;
      }

      await diary.deleteTrackerRecord({ where: { sleepId: updateResp[1][0].uuid }, individualHooks: true });

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n sleep delete error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getById: async (ctx) => {
    try {
      const findResp = await dbService.findOne('sleep', {
        where: { uuid: ctx.request.params.uuid, status: 'Active' },
      });

      if (!findResp) {
        ctx.res.notFound({ msg: responseMessages[1122] });
        return;
      }

      ctx.res.ok({ result: findResp });
      return;
    } catch (error) {
      console.log('\n sleep find error...', error);
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
          entryDate: {
            [Op.gte]: commonService.indiaTz(ctx.request.query.fromDate).startOf('day'),
          },
        });
      }

      if (ctx.request.query.toDate) {
        findQuery.where[Op.and].push({
          entryDate: {
            [Op.lte]: commonService.indiaTz(ctx.request.query.toDate).endOf('day'),
          },
        });
      }

      const { count, rows } = await dbService.findAndCountAll('sleep', findQuery);

      if (!rows) {
        ctx.res.notFound({ msg: responseMessages[1122] });
        return;
      }

      ctx.res.ok({ result: rows, count });
      return;
    } catch (error) {
      console.log('\n sleep find list error...', error);
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
        ctx.res.ok({ result: chartDataResp.result });
      } else {
        ctx.res.internalServerError({ error: chartDataResp.error });
      }
      return;
    } catch (error) {
      console.log('\n sleep find list error...', error);
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

      const findData = await dbService.findAll('sleep', findQuery);

      ctx.res.ok({ result: findData });
      return;
    } catch (error) {
      console.log('\n sleep find list error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  syncFhir: async (ctx) => {
    try {
      const updatePromise = _.filter(ctx.request.body.fhirSyncArray || [], (innerData) => !innerData.deleted).map(
        (innerData) =>
          dbService.update('sleep', { fhirSynced: true, fhirId: innerData.fhirId }, { where: { id: innerData.id } }, {})
      );

      const idsToDelete = _.filter(ctx.request.body.fhirSyncArray || [], (innerData) => innerData.deleted).map(
        (innerData) => innerData.id
      );

      const updateResp = await Promise.all(updatePromise);
      const deletedResp = await dbService.destroy('sleep', { where: { id: { [Op.in]: idsToDelete } } });

      ctx.res.ok({ result: { updateResp, deletedResp } });
      return;
    } catch (error) {
      console.log('\n sleep fhir sync update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
};

const getWeeksDashboardData = (fromDate, toDate, responseArray) => {
  let daysHavingRecords = 0;
  const weekDates = commonService.getAllDates(fromDate, toDate, 'week');
  const managedOverview = [];
  let totalManagedOverview = 0;
  let sleepInterrupted = 0;
  const yValues = weekDates.map((xData) => {
    const dateFindIdx = _.findIndex(responseArray, { date: xData });
    let overViewRate = 0;
    let duration = 0;
    if (dateFindIdx != -1) {
      duration = moment(responseArray[dateFindIdx].toTime).diff(moment(responseArray[dateFindIdx].fromTime), 'minutes');
      daysHavingRecords++;
      overViewRate = responseArray[dateFindIdx].managedStatus || 0;
      for (const wakeupData of responseArray[dateFindIdx].wakeup) {
        sleepInterrupted++;
        duration -= parseInt(wakeupData.duration);
      }
    }
    managedOverview.push(commonService.roundDecimal(overViewRate));
    return commonService.roundDecimal(duration);
  });
  const xValues = weekDates.map((dateValue) => moment(dateValue).format('DD/MM (ddd)'));
  const total = commonService.roundDecimal(commonService.countArr(yValues, ''));
  totalManagedOverview = commonService.roundDecimal(commonService.countArr(managedOverview));
  return {
    xValues,
    totalDays: weekDates.length,
    yValues,
    total,
    managedOverview,
    totalManagedOverview,
    daysHavingRecords,
    sleepInterrupted,
  };
};
const getMonthsDashboardData = (monthDate, responseArray) => {
  const { weeksArr, weeksNumArr } = commonService.getAllWeeksFromMonth(monthDate);
  const xValues = weeksArr;
  let monthTotalManagedOverview = 0;
  let monthSleepInterrupted = 0;
  const monthsCountArr = weeksNumArr.map((weeksData) => {
    const { totalDays, total, managedOverview, daysHavingRecords, totalManagedOverview, sleepInterrupted } =
      getWeeksDashboardData(weeksData.start, weeksData.end, responseArray);
    monthTotalManagedOverview += commonService.roundDecimal(totalManagedOverview);
    monthSleepInterrupted += commonService.roundDecimal(sleepInterrupted);
    return {
      totalDays,
      totalCount: total,
      managedOverview,
      daysHavingRecords,
    };
  });
  const total = commonService.roundDecimal(
    commonService.countArr(
      monthsCountArr.map((countData) => countData.totalCount),
      ''
    )
  );
  const yValues = monthsCountArr.map((innerData) =>
    commonService.roundDecimal(innerData.totalCount / innerData.daysHavingRecords));
  const managedOverview = monthsCountArr.map((innerData) =>
    commonService.roundDecimal(commonService.countArr(innerData.managedOverview) / innerData.daysHavingRecords));
  const daysHavingRecords = commonService.countArr(
    monthsCountArr.map((countData) => countData.daysHavingRecords),
    ''
  );
  return {
    xValues,
    daysHavingRecords,
    totalDays: Number(moment(monthDate).daysInMonth()),
    yValues,
    total,
    managedOverview,
    totalManagedOverview: commonService.roundDecimal(monthTotalManagedOverview),
    sleepInterrupted: monthSleepInterrupted,
  };
};
const getYearDashboardData = (yearDate, responseArray) => {
  const xValues = moment.monthsShort();
  const yearCountData = xValues.map((monthName) => {
    const monthStartDate = moment(`01-${monthName}-${moment(yearDate).format('YYYY')}`, 'DD-MMM-YYYY').format(
      'YYYY-MM-DD'
    );
    return getMonthsDashboardData(monthStartDate, responseArray);
  });
  const total = commonService.roundDecimal(
    commonService.countArr(
      yearCountData.map((countData) => countData.total),
      ''
    )
  );
  const managedOverview = yearCountData.map((innerData) =>
    commonService.roundDecimal(innerData.totalManagedOverview / innerData.daysHavingRecords));
  const totalManagedOverview = commonService.roundDecimal(
    commonService.countArr(yearCountData.map((innerData) => innerData.totalManagedOverview))
  );
  const sleepInterrupted = commonService.countArr(yearCountData.map((innerData) => innerData.sleepInterrupted));
  const yValues = yearCountData.map((innerData) =>
    commonService.roundDecimal(innerData.total / innerData.daysHavingRecords));
  const daysHavingRecords = commonService.countArr(
    yearCountData.map((countData) => countData.daysHavingRecords),
    ''
  );
  return { xValues, yValues, total, managedOverview, totalManagedOverview, sleepInterrupted, daysHavingRecords };
};
