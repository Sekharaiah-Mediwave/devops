const commonService = require('../services/common-service');
const dbService = require('../services/db-service');
const { _, moment, uuidv4 } = require('../services/imports');
const { Sequelize } = require('../config/sequelize');

const { Op } = Sequelize;
const diary = require('./diary');
const responseMessages = require('../middleware/response-messages');

const getWeeksDashboardData = (fromDate, toDate, responseArray) => {
  let daysHavingRecords = 0;
  const weekDates = commonService.getAllDates(fromDate, toDate, 'week');
  const managedOverview = [];
  const yValues = weekDates.map((xData) => {
    const dateFindIdx = _.findIndex(responseArray, { date: xData });
    let overViewRate = 0;
    if (dateFindIdx != -1) {
      daysHavingRecords++;
      overViewRate = responseArray[dateFindIdx].managedStatus;
    }
    managedOverview.push(commonService.roundDecimal(overViewRate));
    return commonService.roundDecimal(overViewRate);
  });
  const xValues = weekDates.map((dateValue) => moment(dateValue).format('DD/MM (ddd)'));
  const total = commonService.countArr(yValues, '');
  const totalManagedOverview = commonService.countArr(managedOverview);
  return {
    xValues,
    totalDays: weekDates.length,
    yValues,
    total,
    managedOverview,
    totalManagedOverview,
    daysHavingRecords,
  };
};
const getMonthsDashboardData = (monthDate, responseArray) => {
  const { weeksArr, weeksNumArr } = commonService.getAllWeeksFromMonth(monthDate);
  const xValues = weeksArr;
  let monthTotalManagedOverview = 0;
  const monthsCountArr = weeksNumArr.map((weeksData) => {
    const { totalDays, total, managedOverview, daysHavingRecords, totalManagedOverview } = getWeeksDashboardData(
      weeksData.start,
      weeksData.end,
      responseArray
    );
    monthTotalManagedOverview += totalManagedOverview;
    return {
      totalDays,
      totalCount: total,
      managedOverview,
      daysHavingRecords,
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
  const totalManagedOverview = commonService.roundDecimal(monthTotalManagedOverview);
  return {
    xValues,
    daysHavingRecords,
    totalDays: Number(moment(monthDate).daysInMonth()),
    yValues,
    total,
    managedOverview,
    totalManagedOverview,
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
  const daysHavingRecords = commonService.countArr(
    yearCountData.map((countData) => countData.daysHavingRecords),
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
  return { xValues, yValues, total, managedOverview, totalManagedOverview, daysHavingRecords };
};

const findChartRecords = async (fromDate, toDate, userId, problemId) => {
  try {
    const findQuery = {
      attributes: ['managedStatus', [Sequelize.literal('DATE("datetime")'), 'date']],
      where: {
        [Op.and]: [
          {
            userId,
          },
          {
            problemId,
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

    const findResp = await dbService.findAll('problem_records', findQuery);

    return {
      chart: 'problem',
      id: problemId,
      result: findResp.map((findPatientData) => findPatientData.toJSON()),
    };
  } catch (error) {
    return {
      chart: 'problem',
      id: problemId,
      result: [],
    };
  }
};

const getRecordChartDataFunc = async (type, fromDate, toDate, userId, problemId) => {
  try {
    const { result } = await findChartRecords(fromDate, toDate, userId, problemId);

    let xValues = [];
    let yValues = [];
    let managedOverview = [];
    let totalManagedOverview = 0;
    let averageManagedOverview = 0;
    let total = 0;
    let daysHavingRecords = 0;
    // const totalDays = (moment(toDate).diff(moment(fromDate), 'days') + 1);

    switch (type) {
      case 'week':
        ({ xValues, yValues, totalManagedOverview, managedOverview, total, daysHavingRecords } = getWeeksDashboardData(
          fromDate,
          toDate,
          result
        ));
        break;
      case 'month':
        ({ xValues, yValues, totalManagedOverview, managedOverview, total, daysHavingRecords } = getMonthsDashboardData(
          fromDate,
          result
        ));
        break;
      case 'year':
        ({ xValues, yValues, totalManagedOverview, managedOverview, total, daysHavingRecords } = getYearDashboardData(
          fromDate,
          result
        ));
        // averageManagedOverview = commonService.roundDecimal(totalManagedOverview / totalDays);
        break;
    }

    averageManagedOverview = commonService.roundDecimal(totalManagedOverview / daysHavingRecords);

    return {
      chart: 'problem',
      id: problemId,
      status: 1,
      msg: 'success',
      result: {
        daysHavingRecords,
        xValues,
        yValues,
        average: { avgOverview: averageManagedOverview },
        managedOverview,
        total,
      },
    };
  } catch (error) {
    console.log('\n smoke find list error...', error);
    return {
      chart: 'problem',
      id: problemId,
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
      (innerData) => !innerData.deleted && innerData.problemRecordId
    ).map((innerData) =>
      dbService.update(
        'problem_records',
        { fhirSynced: true, fhirId: innerData.fhirId },
        { where: { id: innerData.problemRecordId } },
        {}
      ));

    const idsToDelete = _.filter(
      fhirSyncArray || [],
      (innerData) => innerData.deleted && innerData.problemRecordId
    ).map((innerData) => innerData.problemRecordId);
    const problemIdsToDelete = _.filter(
      fhirSyncArray || [],
      (innerData) => innerData.deleted && innerData.problemId
    ).map((innerData) => innerData.problemId);

    const updateResp = await Promise.all(updatePromise);
    const deletedResp = await dbService.destroy('problem_records', {
      where: {
        [Op.or]: [{ id: { [Op.in]: idsToDelete } }, { problemId: { [Op.in]: problemIdsToDelete } }],
      },
    });

    return {
      status: 1,
      msg: 'success',
      result: { updateResp, deletedResp },
    };
  } catch (error) {
    console.log('\n problemRecords fhir sync update error...', error);
    return {
      message: 'error',
      err: error,
      status: 0,
    };
  }
};

module.exports = {
  getRecordChartDataFunc,
  findChartRecords,
  saveProblem: async (ctx) => {
    try {
      const savePayload = {
        uuid: uuidv4(),
        userId: ctx.request.body.userId || ctx.req.decoded.uuid,
        refer: ctx.request.body.refer,
        describe: ctx.request.body.describe,
        startedFrom: ctx.request.body.startedFrom,
        effectOnMood: ctx.request.body.effectOnMood,
        managedStatus: ctx.request.body.managedStatus,
        status: ctx.request.body.status,
      };

      const saveResp = await dbService.create('problem', savePayload, {});

      if (!saveResp) {
        ctx.res.forbidden({ msg: responseMessages[1108] });
        return;
      }

      ctx.res.ok({ result: saveResp });
      return;
    } catch (error) {
      console.log('\n problem save error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getProblemList: async (ctx) => {
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

      if (ctx.request.query.startedFrom) {
        findQuery.where[Op.and].push(
          Sequelize.where(
            Sequelize.fn('date', Sequelize.col('startedFrom')),
            '=',
            commonService.indiaTz(ctx.request.query.startedFrom).format('YYYY-MM-DD')
          )
        );
      }

      if (ctx.request.query.fromDate) {
        findQuery.where[Op.and].push({
          startedFrom: { [Op.gte]: commonService.indiaTz(ctx.request.query.fromDate).startOf('day') },
        });
      }

      if (ctx.request.query.toDate) {
        findQuery.where[Op.and].push({
          startedFrom: { [Op.lte]: commonService.indiaTz(ctx.request.query.toDate).endOf('day') },
        });
      }

      const { count, rows } = await dbService.findAndCountAll('problem', findQuery);

      if (!rows) {
        ctx.res.notFound({ msg: responseMessages[1115] });
        return;
      }

      ctx.res.ok({ result: rows, count });
      return;
    } catch (error) {
      console.log('\n problem find list error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  toggleArchiveProblem: async (ctx) => {
    try {
      const updatePayload = {
        status: ctx.request.body.status,
      };

      const updateResp = await dbService.update(
        'problem',
        updatePayload,
        { where: { uuid: ctx.request.body.uuids }, individualHooks: true },
        {}
      );

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1109] });
        return;
      }

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n problem update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  deleteProblem: async (ctx) => {
    try {
      const updatePayload = {
        status: 'Inactive',
      };

      const updateResp = await dbService.update(
        'problem',
        updatePayload,
        { where: { uuid: ctx.request.query.uuid }, individualHooks: true },
        {}
      );

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1110] });
        return;
      }

      await dbService.update(
        'problem_records',
        updatePayload,
        { where: { problemId: updateResp[1][0].uuid }, individualHooks: true },
        {}
      );

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n problem delete error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getProblemById: async (ctx) => {
    try {
      let findResp = await dbService.findOne('problem', { where: { uuid: ctx.request.params.uuid, status: 'Active' } });

      if (!findResp) {
        ctx.res.notFound({ msg: responseMessages[1115] });
        return;
      }

      findResp = findResp.toJSON();

      ctx.res.ok({ result: { ...findResp, totalUnits: commonService.sumValuesInObject(findResp.drinkedItems) } });
      return;
    } catch (error) {
      console.log('\n problem find error...', error);
      ctx.res.internalServerError({ error });
    }
  },

  saveProblemRecord: async (ctx) => {
    try {
      const savePayload = {
        uuid: uuidv4(),
        userId: ctx.request.body.userId || ctx.req.decoded.uuid,
        problemId: ctx.request.body.problemId,
        datetime: ctx.request.body.datetime,
        effectOnMood: ctx.request.body.effectOnMood,
        managedStatus: ctx.request.body.managedStatus,
        notes: ctx.request.body.notes,
        status: ctx.request.body.status,
      };

      const findResp = await dbService.findOne('problem_records', {
        where: {
          problemId: savePayload.problemId,
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
        ctx.res.conflict({ msg: responseMessages[1116] });
        return;
      }

      const saveResp = await dbService.create('problem_records', savePayload, {});

      if (!saveResp) {
        ctx.res.forbidden({ msg: responseMessages[1108] });
        return;
      }

      if (ctx.request.body.add_to_diary) {
        await diary.saveDiaryRecord({
          uuid: uuidv4(),
          userId: ctx.request.body.userId || ctx.req.decoded.uuid,
          entryDate: moment(ctx.request.body.datetime).format('YYYY-MM-DD'),
          status: 'Active',
          notes: '',
          createdFrom: 'problem',
          problemId: saveResp.uuid,
        });
      }

      ctx.res.ok({ result: saveResp });
      return;
    } catch (error) {
      console.log('\n problem record save error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  updateProblemRecord: async (ctx) => {
    try {
      const updatePayload = {
        userId: ctx.request.body.userId || ctx.req.decoded.uuid,
        problemId: ctx.request.body.problemId,
        datetime: ctx.request.body.datetime,
        effectOnMood: ctx.request.body.effectOnMood,
        managedStatus: ctx.request.body.managedStatus,
        notes: ctx.request.body.notes,
        status: ctx.request.body.status,
      };

      const findResp = await dbService.findOne('problem_records', {
        where: {
          problemId: updatePayload.problemId,
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
        ctx.res.conflict({ msg: responseMessages[1116] });
        return;
      }

      const updateResp = await dbService.update(
        'problem_records',
        updatePayload,
        { where: { uuid: ctx.request.body.uuid }, individualHooks: true },
        {}
      );

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1111] });
        return;
      }

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n problem_records update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getProblemRecordList: async (ctx) => {
    try {
      const findQuery = {
        order: [['datetime', 'DESC']],
        include: [{ model: 'problem', as: 'problemInfo', attributes: ['uuid', 'id'], where: { status: 'Active' } }],
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

      if (ctx.request.query.problemId) {
        findQuery.where[Op.and].push({ problemId: ctx.request.query.problemId });
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

      const { count, rows } = await dbService.findAndCountAll('problem_records', findQuery);

      if (!rows) {
        ctx.res.notFound({ msg: responseMessages[1114] });
        return;
      }

      ctx.res.ok({ result: rows, count });
      return;
    } catch (error) {
      console.log('\n problem record find list error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  toggleArchiveProblemRecord: async (ctx) => {
    try {
      const updatePayload = {
        status: ctx.request.body.status,
      };

      const updateResp = await dbService.update(
        'problem_records',
        updatePayload,
        { where: { uuid: ctx.request.body.uuids }, individualHooks: true },
        {}
      );

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1112] });
        return;
      }

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n problem record update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  deleteProblemRecord: async (ctx) => {
    try {
      const updatePayload = {
        status: 'Inactive',
      };

      const updateResp = await dbService.update(
        'problem_records',
        updatePayload,
        { where: { uuid: ctx.request.query.uuid }, individualHooks: true },
        {}
      );

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1113] });
        return;
      }

      await diary.deleteTrackerRecord({ where: { problemId: updateResp[1][0].uuid }, individualHooks: true });

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n problem record delete error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getProblemRecordById: async (ctx) => {
    try {
      let findResp = await dbService.findOne('problem_records', {
        where: { uuid: ctx.request.params.uuid, status: 'Active' },
      });

      if (!findResp) {
        ctx.res.notFound({ msg: responseMessages[1114] });
        return;
      }

      findResp = findResp.toJSON();

      ctx.res.ok({ result: { ...findResp, totalUnits: commonService.sumValuesInObject(findResp.drinkedItems) } });
      return;
    } catch (error) {
      console.log('\n problem record find error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getRecordChartData: async (ctx) => {
    try {
      const chartDataResp = await getRecordChartDataFunc(
        ctx.request.query.type,
        ctx.request.query.fromDate,
        ctx.request.query.toDate,
        ctx.request.query.userId || ctx.req.decoded.uuid,
        ctx.request.query.problemId
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
      const problemQuery = {
        where: { fhirSynced: false },
        include: [{ model: 'user', as: 'userInfo', attributes: ['id', 'fhirId'] }],
      };
      const recordQuery = {
        where: { fhirSynced: false },
        include: [
          { model: 'user', as: 'userInfo', attributes: ['id', 'fhirId'] },
          { model: 'problem', as: 'problemInfo', attributes: ['id', 'uuid', 'fhirId'] },
        ],
      };

      const problemData = await dbService.findAll('problem', problemQuery);

      const recordData = await dbService.findAll('problem_records', recordQuery);

      ctx.res.ok({ result: { problem: problemData, records: recordData } });
      return;
    } catch (error) {
      console.log('\n problem find list error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  syncFhir: async (ctx) => {
    try {
      const problemRecordUpdateResp = await syncFhirRecords(ctx.request.body.fhirSyncArray);
      const updatePromise = _.filter(
        ctx.request.body.fhirSyncArray || [],
        (innerData) => !innerData.deleted && innerData.problemId
      ).map((innerData) =>
        dbService.update(
          'problem',
          { fhirSynced: true, fhirId: innerData.fhirId },
          { where: { id: innerData.problemId } },
          {}
        ));

      const idsToDelete = _.filter(
        ctx.request.body.fhirSyncArray || [],
        (innerData) => innerData.deleted && innerData.problemId
      ).map((innerData) => innerData.problemId);

      const updateResp = await Promise.all(updatePromise);
      const deletedResp = await dbService.destroy('problem', { where: { id: { [Op.in]: idsToDelete } } });

      ctx.res.ok({ result: { updateResp, deletedResp, problemRecords: problemRecordUpdateResp } });
      return;
    } catch (error) {
      console.log('\n problem fhir sync update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
};
