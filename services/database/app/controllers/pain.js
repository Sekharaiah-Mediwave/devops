const commonService = require('../services/common-service');
const dbService = require('../services/db-service');
const { Sequelize } = require('../config/sequelize');
const { _, moment, uuidv4 } = require('../services/imports');

const { Op } = Sequelize;
const diary = require('./diary');
const responseMessages = require('../middleware/response-messages');

const getWeeksDashboardData = (fromDate, toDate, responseArray) => {
  const startedFrom = { morning: 0, afternoon: 0, evening: 0 };
  let daysHavingRecords = 0;
  const weekDates = commonService.getAllDates(fromDate, toDate, 'week');
  const managedOverview = [];
  let totalManagedOverview = 0;
  let totalSeverity = 0;
  const yValues = weekDates.map((xData) => {
    const dateFindIdx = _.findIndex(responseArray, { date: xData });
    let overViewRate = 0;
    let duration = 0;
    if (dateFindIdx != -1) {
      daysHavingRecords++;
      overViewRate = responseArray[dateFindIdx].severity || 0;
      duration = responseArray[dateFindIdx].duration || 0;
      startedFrom[responseArray[dateFindIdx].startedFrom] += 1;
      totalManagedOverview += commonService.roundDecimal(responseArray[dateFindIdx].overviewsRate || 0);
      totalSeverity += overViewRate;
    }
    managedOverview.push(commonService.roundDecimal(overViewRate));
    return commonService.roundDecimal(duration);
  });
  const xValues = weekDates.map((dateValue) => moment(dateValue).format('DD/MM (ddd)'));
  const total = commonService.countArr(yValues, '');
  return {
    xValues,
    totalDays: weekDates.length,
    yValues,
    total,
    managedOverview,
    totalManagedOverview,
    daysHavingRecords,
    totalSeverity,
    startedFrom,
  };
};
const getMonthsDashboardData = (monthDate, responseArray) => {
  const { weeksArr, weeksNumArr } = commonService.getAllWeeksFromMonth(monthDate);
  const xValues = weeksArr;
  const monthStartedFrom = { morning: 0, afternoon: 0, evening: 0 };
  let monthTotalManagedOverview = 0;
  let monthTotalSeverity = 0;
  const monthsCountArr = weeksNumArr.map((weeksData) => {
    const { totalDays, total, managedOverview, daysHavingRecords, totalManagedOverview, totalSeverity, startedFrom } =
      getWeeksDashboardData(weeksData.start, weeksData.end, responseArray);
    monthTotalManagedOverview += totalManagedOverview;
    monthTotalSeverity += totalSeverity;
    for (const key in startedFrom) {
      if (startedFrom[key] > -1) {
        monthStartedFrom[key] += startedFrom[key];
      }
    }
    return {
      totalDays,
      totalCount: total,
      managedOverview,
      daysHavingRecords,
      totalSeverity,
    };
  });
  const daysHavingRecords = commonService.countArr(
    monthsCountArr.map((countData) => countData.daysHavingRecords),
    ''
  );
  const total = commonService.countArr(
    monthsCountArr.map((countData) => countData.totalCount),
    ''
  );
  const yValues = monthsCountArr.map((innerData) =>
    commonService.roundDecimal(innerData.totalCount / innerData.daysHavingRecords));
  const managedOverview = monthsCountArr.map((innerData) =>
    commonService.roundDecimal(commonService.countArr(innerData.managedOverview) / innerData.daysHavingRecords));
  return {
    xValues,
    daysHavingRecords,
    startedFrom: monthStartedFrom,
    totalDays: Number(moment(monthDate).daysInMonth()),
    yValues,
    total,
    managedOverview,
    totalManagedOverview: commonService.roundDecimal(monthTotalManagedOverview),
    totalSeverity: monthTotalSeverity,
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
  const startedFrom = {
    morning: commonService.countArr(
      yearCountData.map((countData) => countData.startedFrom.morning),
      ''
    ),
    afternoon: commonService.countArr(
      yearCountData.map((countData) => countData.startedFrom.afternoon),
      ''
    ),
    evening: commonService.countArr(
      yearCountData.map((countData) => countData.startedFrom.evening),
      ''
    ),
  };
  const daysHavingRecords = commonService.countArr(
    yearCountData.map((countData) => countData.daysHavingRecords),
    ''
  );
  const totalSeverity = commonService.countArr(
    yearCountData.map((countData) => countData.totalSeverity),
    ''
  );
  const total = commonService.countArr(
    yearCountData.map((countData) => countData.total),
    ''
  );
  const managedOverview = yearCountData.map((innerData) =>
    commonService.roundDecimal(innerData.totalManagedOverview / innerData.daysHavingRecords));
  const totalManagedOverview = commonService.roundDecimal(
    commonService.countArr(yearCountData.map((innerData) => innerData.totalManagedOverview))
  );
  const yValues = yearCountData.map((innerData) =>
    commonService.roundDecimal(innerData.total / innerData.daysHavingRecords));
  return {
    xValues,
    yValues,
    total,
    managedOverview,
    totalManagedOverview,
    daysHavingRecords,
    totalSeverity,
    startedFrom,
  };
};

const findChartRecords = async (fromDate, toDate, userId, painId) => {
  try {
    const findQuery = {
      attributes: [
        'overviewsRate',
        'startedFrom',
        'severity',
        'duration',
        [Sequelize.literal('DATE("datetime")'), 'date'],
      ],
      where: {
        [Op.and]: [
          {
            userId,
          },
          {
            painId,
          },
          {
            status: 'Active',
          },
          Sequelize.where(
            Sequelize.fn('date', Sequelize.col('datetime')),
            '>=',
            commonService.indiaTz(fromDate).format('YYYY-MM-DD')
          ),
          Sequelize.where(
            Sequelize.fn('date', Sequelize.col('datetime')),
            '<=',
            commonService.indiaTz(toDate).format('YYYY-MM-DD')
          ),
        ],
      },
    };

    const findResp = await dbService.findAll('pain_condition_records', findQuery);

    return {
      chart: 'pain',
      id: painId,
      result: findResp.map((findPatientData) => findPatientData.toJSON()),
    };
  } catch (error) {
    return {
      chart: 'pain',
      id: painId,
      result: [],
    };
  }
};

const getPainRecordChartDataFunc = async (type, fromDate, toDate, userId, painId) => {
  try {
    const { result } = await findChartRecords(fromDate, toDate, userId, painId);

    let xValues = [];
    let yValues = [];
    let managedOverview = [];
    let totalManagedOverview = 0;
    let average = { avgOverview: 0, avgPainPerDay: 0, avgSeverity: 0, avgWorst: '' };
    let total = 0;
    let daysHavingRecords = 0;
    let totalSeverity = 0;
    let startedFrom = { morning: 0, afternoon: 0, evening: 0 };
    // const totalNumberOfDays = (moment(toDate).diff(moment(fromDate), 'days') + 1);

    switch (type) {
      case 'week':
        ({
          xValues,
          yValues,
          totalManagedOverview,
          managedOverview,
          total,
          daysHavingRecords,
          totalSeverity,
          startedFrom,
        } = getWeeksDashboardData(fromDate, toDate, result));
        break;
      case 'month':
        ({
          xValues,
          yValues,
          totalManagedOverview,
          managedOverview,
          total,
          daysHavingRecords,
          totalSeverity,
          startedFrom,
        } = getMonthsDashboardData(fromDate, result));
        break;
      case 'year':
        ({
          xValues,
          yValues,
          totalManagedOverview,
          managedOverview,
          total,
          daysHavingRecords,
          totalSeverity,
          startedFrom,
        } = getYearDashboardData(fromDate, result));
        // average = {
        //     avgOverview: commonService.roundDecimal(totalManagedOverview / totalNumberOfDays),
        //     avgPainPerDay: commonService.roundDecimal(total / totalNumberOfDays),
        //     avgSeverity: commonService.roundDecimal(commonService.countArr(managedOverview) / totalNumberOfDays)
        // };
        break;
    }

    average = {
      avgOverview: commonService.roundDecimal(totalManagedOverview / daysHavingRecords),
      avgPainPerDay: commonService.roundDecimal(total / daysHavingRecords),
      avgSeverity: commonService.roundDecimal(totalSeverity / daysHavingRecords),
      avgWorst: Object.keys(startedFrom).reduce((a, b) => (startedFrom[a] >= startedFrom[b] ? a : b)),
    };

    return {
      chart: 'pain',
      id: painId,
      status: 1,
      msg: 'success',
      result: {
        daysHavingRecords,
        xValues,
        yValues,
        average,
        managedOverview,
        totalDuration: total,
      },
    };
  } catch (error) {
    console.log('\n smoke find list error...', error);
    return {
      chart: 'pain',
      id: painId,
      message: 'error',
      error,
      status: 0,
    };
  }
};

const syncFhirRecords = async (fhirSyncArray = []) => {
  try {
    const updatePromise = _.filter(
      fhirSyncArray || [],
      (innerData) => !innerData.deleted && innerData.painRecordId
    ).map((innerData) =>
      dbService.update(
        'pain_condition_records',
        { fhirSynced: true, fhirId: innerData.fhirId },
        { where: { id: innerData.painRecordId } },
        {}
      ));

    const idsToDelete = _.filter(fhirSyncArray || [], (innerData) => innerData.deleted && innerData.painRecordId).map(
      (innerData) => innerData.painRecordId
    );
    const painIdsToDelete = _.filter(fhirSyncArray || [], (innerData) => innerData.deleted && innerData.painId).map(
      (innerData) => innerData.painId
    );

    const updateResp = await Promise.all(updatePromise);
    const deletedResp = await dbService.destroy('pain_condition_records', {
      where: {
        [Op.or]: [{ id: { [Op.in]: idsToDelete } }, { painId: { [Op.in]: painIdsToDelete } }],
      },
    });

    return {
      status: 1,
      msg: 'success',
      result: { updateResp, deletedResp },
    };
  } catch (error) {
    console.log('\n pain_condition_records fhir sync update error...', error);
    return {
      message: 'error',
      err: error,
      status: 0,
    };
  }
};
module.exports = {
  getPainRecordChartDataFunc,
  findChartRecords,
  async createPain(ctx) {
    try {
      const savePayload = {
        uuid: uuidv4(),
        userId: ctx.request.body.userId || ctx.req.decoded.uuid,
        startedFrom: ctx.request.body.startedFrom,
        refer: ctx.request.body.refer,
        describeCondition: ctx.request.body.describeCondition,
        whereHurts: ctx.request.body.whereHurts,
        severity: ctx.request.body.severity,
        effectOnMood: ctx.request.body.effectOnMood,
      };

      const saveResp = await dbService.create('pain_conditions', savePayload, {});

      if (!saveResp) {
        ctx.res.forbidden({ msg: responseMessages[1099] });
        return;
      }

      ctx.res.ok({ result: saveResp });
      return;
    } catch (error) {
      console.log('\n pain condition save error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  async getPainList(ctx) {
    try {
      const findQuery = {
        order: [['createdAt', 'DESC']],
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

      const { count, rows } = await dbService.findAndCountAll('pain_conditions', findQuery);

      if (!rows) {
        ctx.res.notFound({ msg: responseMessages[1106] });
        return;
      }

      ctx.res.ok({ result: rows, count });
      return;
    } catch (error) {
      console.log('\n pain find list error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  toggleArchivePain: async (ctx) => {
    try {
      const updatePayload = {
        status: ctx.request.body.status,
      };

      const updateResp = await dbService.update(
        'pain_conditions',
        updatePayload,
        { where: { uuid: ctx.request.body.uuids }, individualHooks: true },
        {}
      );

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1100] });
        return;
      }

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n pain update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  deletePain: async (ctx) => {
    try {
      const updatePayload = {
        status: 'Inactive',
      };

      const updateResp = await dbService.update(
        'pain_conditions',
        updatePayload,
        { where: { uuid: ctx.request.query.uuid }, individualHooks: true },
        {}
      );

      if (!updateResp || (updateResp && !updateResp[0])) {
        ctx.res.forbidden({ msg: responseMessages[1101] });
        return;
      }

      await dbService.update(
        'pain_condition_records',
        updatePayload,
        { where: { painId: updateResp[1][0].uuid }, individualHooks: true },
        {}
      );

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n pain delete error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getPainById: async (ctx) => {
    try {
      let findResp = await dbService.findOne('pain_conditions', {
        where: { uuid: ctx.request.params.uuid, status: 'Active' },
      });

      if (!findResp) {
        ctx.res.notFound({ msg: responseMessages[1106] });
        return;
      }

      findResp = findResp.toJSON();

      ctx.res.ok({ result: { ...findResp, totalUnits: commonService.sumValuesInObject(findResp.drinkedItems) } });
      return;
    } catch (error) {
      console.log('\n pain find error...', error);
      ctx.res.internalServerError({ error });
    }
  },

  savePainRecord: async (ctx) => {
    try {
      const savePayload = {
        uuid: uuidv4(),
        userId: ctx.request.body.userId || ctx.req.decoded.uuid,
        painId: ctx.request.body.painId,
        datetime: ctx.request.body.datetime,
        severity: ctx.request.body.severity,
        startedFrom: ctx.request.body.startedFrom,
        duration: ctx.request.body.duration,
        effectOnMood: ctx.request.body.effectOnMood,
        overviewsRate: ctx.request.body.overviewsRate,
        notes: ctx.request.body.notes,
        status: ctx.request.body.status,
      };

      const findResp = await dbService.findOne('pain_condition_records', {
        where: {
          painId: savePayload.painId,
          userId: savePayload.userId,
          status: { [Op.ne]: 'Inactive' },
          [Op.and]: [
            Sequelize.where(
              Sequelize.fn('date', Sequelize.col('datetime')),
              '=',
              commonService.indiaTz(savePayload.datetime).format('YYYY-MM-DD')
            ),
          ],
        },
      });

      if (findResp) {
        ctx.res.conflict({ msg: responseMessages[1107] });
        return;
      }

      const saveResp = await dbService.create('pain_condition_records', savePayload, {});

      if (!saveResp) {
        ctx.res.forbidden({ msg: responseMessages[1102] });
        return;
      }

      if (ctx.request.body.add_to_diary) {
        await diary.saveDiaryRecord({
          uuid: uuidv4(),
          userId: ctx.request.body.userId || ctx.req.decoded.uuid,
          entryDate: moment(ctx.request.body.datetime).format('YYYY-MM-DD'),
          status: 'Active',
          notes: '',
          createdFrom: 'pain',
          painId: saveResp.uuid,
        });
      }

      ctx.res.ok({ result: saveResp });
      return;
    } catch (error) {
      console.log('\n pain record save error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  updatePainRecord: async (ctx) => {
    try {
      const updatePayload = {
        userId: ctx.request.body.userId || ctx.req.decoded.uuid,
        painId: ctx.request.body.painId,
        datetime: ctx.request.body.datetime,
        severity: ctx.request.body.severity,
        startedFrom: ctx.request.body.startedFrom,
        duration: ctx.request.body.duration,
        effectOnMood: ctx.request.body.effectOnMood,
        overviewsRate: ctx.request.body.overviewsRate,
        notes: ctx.request.body.notes,
        status: ctx.request.body.status,
      };

      const findResp = await dbService.findOne('pain_condition_records', {
        where: {
          painId: updatePayload.painId,
          userId: updatePayload.userId,
          status: { [Op.ne]: 'Inactive' },
          [Op.and]: [
            Sequelize.where(
              Sequelize.fn('date', Sequelize.col('datetime')),
              '=',
              commonService.indiaTz(updatePayload.datetime).format('YYYY-MM-DD')
            ),
            {
              uuid: { [Op.not]: ctx.request.body.uuid },
            },
          ],
        },
      });

      if (findResp) {
        ctx.res.conflict({ msg: responseMessages[1107] });
        return;
      }

      const updateResp = await dbService.update(
        'pain_condition_records',
        updatePayload,
        { where: { uuid: ctx.request.body.uuid }, individualHooks: true },
        {}
      );

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1103] });
        return;
      }

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n pain_condition_records update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getPainRecordList: async (ctx) => {
    try {
      const findQuery = {
        order: [['datetime', 'DESC']],
        include: [
          {
            model: 'pain_conditions',
            as: 'pain_condition_info',
            attributes: ['uuid', 'id'],
            where: { status: 'Active' },
          },
        ],
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

      if (ctx.request.query.painId) {
        findQuery.where[Op.and].push({ painId: ctx.request.query.painId });
      }

      if (ctx.request.query.uuid) {
        findQuery.where[Op.and].push({ uuid: ctx.request.query.uuid });
      }

      if (ctx.request.query.datetime) {
        findQuery.where[Op.and].push(
          Sequelize.where(
            Sequelize.fn('date', Sequelize.col('datetime')),
            '=',
            commonService.indiaTz(ctx.request.query.datetime).format('YYYY-MM-DD')
          )
        );
      }

      if (ctx.request.query.fromDate) {
        findQuery.where[Op.and].push({
          datetime: { [Op.gte]: commonService.indiaTz(ctx.request.query.fromDate).startOf('day') },
        });
      }

      if (ctx.request.query.toDate) {
        findQuery.where[Op.and].push({
          datetime: { [Op.lte]: commonService.indiaTz(ctx.request.query.toDate).endOf('day') },
        });
      }

      const { count, rows } = await dbService.findAndCountAll('pain_condition_records', findQuery);

      if (!rows) {
        ctx.res.notFound({ msg: responseMessages[1106] });
        return;
      }

      ctx.res.ok({ result: rows, count });
      return;
    } catch (error) {
      console.log('\n pain record find list error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  toggleArchivePainRecord: async (ctx) => {
    try {
      const updatePayload = {
        status: ctx.request.body.status,
      };

      const updateResp = await dbService.update(
        'pain_condition_records',
        updatePayload,
        { where: { uuid: ctx.request.body.uuids }, individualHooks: true },
        {}
      );

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1104] });
        return;
      }

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n pain record update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  deletePainRecord: async (ctx) => {
    try {
      const updatePayload = {
        status: 'Inactive',
      };

      const updateResp = await dbService.update(
        'pain_condition_records',
        updatePayload,
        { where: { uuid: ctx.request.query.uuid }, individualHooks: true },
        {}
      );

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1105] });
        return;
      }

      await diary.deleteTrackerRecord({ where: { painId: updateResp[1][0].uuid }, individualHooks: true });

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n pain record delete error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getPainRecordById: async (ctx) => {
    try {
      let findResp = await dbService.findOne('pain_condition_records', {
        where: { uuid: ctx.request.params.uuid, status: 'Active' },
      });

      if (!findResp) {
        ctx.res.notFound({ msg: responseMessages[1106] });
        return;
      }

      findResp = findResp.toJSON();

      ctx.res.ok({ result: { ...findResp, totalUnits: commonService.sumValuesInObject(findResp.drinkedItems) } });
      return;
    } catch (error) {
      console.log('\n pain record find error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getPainRecordChartData: async (ctx) => {
    try {
      const chartDataResp = await getPainRecordChartDataFunc(
        ctx.request.query.type,
        ctx.request.query.fromDate,
        ctx.request.query.toDate,
        ctx.request.query.userId || ctx.req.decoded.uuid,
        ctx.request.query.painId
      );
      if (chartDataResp.status) {
        ctx.res.ok({ result: chartDataResp.result });
      } else {
        ctx.res.internalServerError({ error: chartDataResp.error });
      }
      return;
    } catch (error) {
      console.log('\n smoke find list error...', error);
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
          {
            required: false,
            model: 'pain_condition_records',
            as: 'pain_condition_records',
          },
        ],
      };

      const findData = await dbService.findAll('pain_conditions', findQuery);

      ctx.res.ok({ result: findData });
      return;
    } catch (error) {
      console.log('\n pain_conditions find list error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  syncFhir: async (ctx) => {
    try {
      const painRecordUpdateResp = await syncFhirRecords(ctx.request.body.fhirSyncArray);
      const updatePromise = _.filter(
        ctx.request.body.fhirSyncArray || [],
        (innerData) => !innerData.deleted && innerData.painId
      ).map((innerData) =>
        dbService.update(
          'pain_conditions',
          { fhirSynced: true, fhirId: innerData.fhirId },
          { where: { id: innerData.painId } },
          {}
        ));

      const idsToDelete = _.filter(
        ctx.request.body.fhirSyncArray || [],
        (innerData) => innerData.deleted && innerData.painId
      ).map((innerData) => innerData.painId);

      const updateResp = await Promise.all(updatePromise);
      const deletedResp = await dbService.destroy('pain_conditions', { where: { id: { [Op.in]: idsToDelete } } });

      ctx.res.ok({ result: { updateResp, deletedResp, painRecords: painRecordUpdateResp } });
      return;
    } catch (error) {
      console.log('\n pain_conditions fhir sync update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
};
