const commonService = require('../services/common-service');
const dbService = require('../services/db-service');
const { _, moment, uuidv4 } = require('../services/imports');
const diary = require('./diary');
const { Sequelize } = require('../config/sequelize');

const { Op } = Sequelize;
const cigaretteInsidePacket = 20;
const responseMessages = require('../middleware/response-messages');

const getWeeksDashboardData = (fromDate, toDate, responseArray) => {
  let daysHavingRecords = 0;
  const weekDates = commonService.getAllDates(fromDate, toDate, 'week');
  const managedOverview = [];
  const totals = {
    cigarettes: 0,
    rollUps: 0,
    vapesPuffs: 0,
    vapesStrengths: 0,
  };
  const yValues = weekDates.map((xData) => {
    const dateFilteredCigarettesArr = _.filter(responseArray, { date: xData });
    const totalCigarettes = [0, 0]; /* 1st vape, 2nd cigarette */
    let managedStatus = 0;
    dateFilteredCigarettesArr.forEach((dateFilteredJson) => {
      daysHavingRecords++;
      let rollUpsCount = 0;
      let cigarettesCount = 0;
      managedStatus = dateFilteredJson.managedStatus;
      if (dateFilteredJson?.smokedItems) {
        for (const key in dateFilteredJson.smokedItems) {
          const cigaretteCountValueJson = dateFilteredJson.smokedItems[key];
          if (key === 'vape') {
            totalCigarettes[0] += commonService.roundDecimal(cigaretteCountValueJson.puff || 0);
            totals.vapesStrengths += cigaretteCountValueJson.strength || 0;
            totals.vapesPuffs = totalCigarettes[0];
          } else {
            if (key === 'rollUps') {
              rollUpsCount +=
                (cigaretteCountValueJson.packets || 0) * cigaretteInsidePacket + (cigaretteCountValueJson.singles || 0);
            } else {
              cigarettesCount +=
                (cigaretteCountValueJson.packets || 0) * cigaretteInsidePacket + (cigaretteCountValueJson.singles || 0);
            }
            totalCigarettes[1] = commonService.roundDecimal(rollUpsCount + cigarettesCount);
          }
        }
      }
      totals.rollUps += rollUpsCount;
      totals.cigarettes += cigarettesCount;
    });
    managedOverview.push(managedStatus);
    return totalCigarettes;
  });
  const xValues = weekDates.map((dateValue) => moment(dateValue).format('DD/MM (ddd)'));
  const totalManagedOverview = commonService.countArr(managedOverview);
  return {
    xValues,
    totalDays: weekDates.length,
    yValues,
    managedOverview,
    totals,
    totalManagedOverview,
    daysHavingRecords,
  };
};

const getMonthsDashboardData = (monthDate, responseArray) => {
  const { weeksArr, weeksNumArr } = commonService.getAllWeeksFromMonth(monthDate);
  const xValues = weeksArr;
  let monthTotalManagedOverview = 0;
  const monthsCountArr = weeksNumArr.map((weeksData) => {
    const { totalDays, totals, managedOverview, daysHavingRecords, totalManagedOverview } = getWeeksDashboardData(
      weeksData.start,
      weeksData.end,
      responseArray
    );
    monthTotalManagedOverview += totalManagedOverview;
    return {
      totalDays,
      totals,
      managedOverview,
      daysHavingRecords,
    };
  });
  const daysHavingRecords = commonService.countArr(monthsCountArr.map((innerData) => innerData.daysHavingRecords));
  const yValues = monthsCountArr.map((innerData) => [
    commonService.roundDecimal(innerData.totals.vapesPuffs),
    commonService.roundDecimal(innerData.totals.cigarettes + innerData.totals.rollUps),
  ]);
  const totals = {
    cigarettes: commonService.roundDecimal(
      commonService.countArr(monthsCountArr.map((innerData) => innerData.totals.cigarettes))
    ),
    rollUps: commonService.roundDecimal(
      commonService.countArr(monthsCountArr.map((innerData) => innerData.totals.rollUps))
    ),
    vapesPuffs: commonService.roundDecimal(
      commonService.countArr(monthsCountArr.map((innerData) => innerData.totals.vapesPuffs))
    ),
    vapesStrengths: commonService.roundDecimal(
      commonService.countArr(monthsCountArr.map((innerData) => innerData.totals.vapesStrengths))
    ),
  };
  const managedOverview = monthsCountArr.map((innerData) =>
    commonService.roundDecimal(commonService.countArr(innerData.managedOverview) / innerData.daysHavingRecords));
  const totalManagedOverview = commonService.roundDecimal(monthTotalManagedOverview);
  return {
    xValues,
    daysHavingRecords,
    totalDays: Number(moment(monthDate).daysInMonth()),
    yValues,
    managedOverview,
    totals,
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
  const totals = {
    cigarettes: commonService.roundDecimal(
      commonService.countArr(yearCountData.map((innerData) => innerData.totals.cigarettes))
    ),
    rollUps: commonService.roundDecimal(
      commonService.countArr(yearCountData.map((innerData) => innerData.totals.rollUps))
    ),
    vapesPuffs: commonService.roundDecimal(
      commonService.countArr(yearCountData.map((innerData) => innerData.totals.vapesPuffs))
    ),
    vapesStrengths: commonService.roundDecimal(
      commonService.countArr(yearCountData.map((innerData) => innerData.totals.vapesStrengths))
    ),
  };
  const daysHavingRecords = commonService.roundDecimal(
    commonService.countArr(yearCountData.map((innerData) => innerData.daysHavingRecords))
  );
  const managedOverview = yearCountData.map((innerData) =>
    commonService.roundDecimal(innerData.totalManagedOverview / innerData.daysHavingRecords));
  const totalManagedOverview = commonService.roundDecimal(
    commonService.countArr(yearCountData.map((innerData) => innerData.totalManagedOverview))
  );
  const yValues = yearCountData.map((innerData) => [
    innerData.totals.vapesPuffs,
    innerData.totals.cigarettes + innerData.totals.rollUps,
  ]);
  return {
    xValues,
    daysHavingRecords,
    yValues,
    totals,
    managedOverview,
    totalManagedOverview,
  };
};

const findChartRecords = async (fromDate, toDate, userId) => {
  try {
    const findQuery = {
      attributes: ['managedStatus', 'smokedItems', [Sequelize.literal('DATE("entryDate")'), 'date']],
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

    const findResp = await dbService.findAll('smoke', findQuery);

    return {
      chart: 'smoke',
      result: findResp.map((findPatientData) => findPatientData.toJSON()),
    };
  } catch (error) {
    return {
      chart: 'smoke',
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
    let totalManagedOverview = 0;
    let averageManagedOverview = 0;
    let totals = {};
    let daysHavingRecords = 0;
    // const totalDays = (moment(toDate).diff(moment(fromDate), 'days') + 1);

    switch (type) {
      case 'week':
        ({ xValues, yValues, totalManagedOverview, managedOverview, totals, daysHavingRecords } = getWeeksDashboardData(
          fromDate,
          toDate,
          result
        ));
        break;
      case 'month':
        ({ xValues, yValues, totalManagedOverview, managedOverview, totals, daysHavingRecords } =
          getMonthsDashboardData(fromDate, result));
        break;
      case 'year':
        ({ xValues, yValues, totalManagedOverview, managedOverview, totals, daysHavingRecords } = getYearDashboardData(
          fromDate,
          result
        ));
        // averageManagedOverview = commonService.roundDecimal(totalManagedOverview / totalDays);
        break;
    }

    averageManagedOverview = commonService.roundDecimal(totalManagedOverview / daysHavingRecords);

    return {
      chart: 'smoke',
      status: 1,
      msg: 'success',
      result: {
        daysHavingRecords,
        xValues,
        yValues,
        average: { avgOverview: averageManagedOverview },
        managedOverview,
        totals,
      },
    };
  } catch (error) {
    console.log('\n smoke find list error...', error);
    return {
      chart: 'smoke',
      message: 'error',
      error,
      status: 0,
    };
  }
};

const getLastSmokeInfo = async (userID) => {
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
    return await dbService.findAndCountAll('smoke', findQuery);
  } catch (error) {
    return {
      chart: 'smoke',
      message: 'error',
      err: error,
      status: 0,
    };
  }
};
module.exports = {
  getChartDataFunc,
  getLastSmokeInfo,
  findChartRecords,
  saveRecord: async (ctx) => {
    try {
      const savePayload = {
        uuid: uuidv4(),
        userId: ctx.request.body.userId || ctx.req.decoded.uuid,
        smokedItems: ctx.request.body.smokedItems,
        entryDate: ctx.request.body.entryDate,
        smokeType: ctx.request.body.smokeType,
        notes: ctx.request.body.notes,
        managedStatus: ctx.request.body.managedStatus,
        status: ctx.request.body.status,
      };

      const findResp = await dbService.findOne('smoke', {
        where: {
          userId: savePayload.userId,
          status: { [Op.ne]: 'Inactive' },
          [Op.and]: [
            Sequelize.where(
              Sequelize.fn('date', Sequelize.col('entryDate')),
              '=',
              commonService.indiaTz(savePayload.entryDate).format('YYYY-MM-DD')
            ),
            {
              smokeType: savePayload.smokeType,
            },
          ],
        },
      });

      if (findResp) {
        ctx.res.conflict({ msg: responseMessages[1131] });
        return;
      }

      const saveResp = await dbService.create('smoke', savePayload, {});

      if (!saveResp) {
        ctx.res.forbidden({ msg: responseMessages[1134] });
        return;
      }

      if (ctx.request.body.add_to_diary) {
        await diary.saveDiaryRecord({
          uuid: uuidv4(),
          userId: ctx.request.body.userId || ctx.req.decoded.uuid,
          entryDate: moment(ctx.request.body.entryDate).format('YYYY-MM-DD'),
          status: 'Active',
          notes: '',
          createdFrom: 'smoke',
          smokeId: saveResp.uuid,
        });
      }

      ctx.res.ok({ result: saveResp });
      return;
    } catch (error) {
      console.log('\n Smoke save error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  updateRecord: async (ctx) => {
    try {
      const updatePayload = {
        userId: ctx.request.body.userId || ctx.req.decoded.uuid,
        smokedItems: ctx.request.body.smokedItems,
        entryDate: ctx.request.body.entryDate,
        smokeType: ctx.request.body.smokeType,
        notes: ctx.request.body.notes,
        managedStatus: ctx.request.body.managedStatus,
        status: ctx.request.body.status,
      };

      const findResp = await dbService.findOne('smoke', {
        where: {
          [Op.and]: [
            Sequelize.where(
              Sequelize.fn('date', Sequelize.col('entryDate')),
              '=',
              commonService.indiaTz(updatePayload.entryDate).format('YYYY-MM-DD')
            ),
            {
              uuid: { [Op.not]: ctx.request.body.uuid },
            },
            {
              status: { [Op.ne]: 'Inactive' },
            },
            {
              smokeType: updatePayload.smokeType,
            },
          ],
        },
      });

      if (findResp) {
        ctx.res.conflict({ msg: responseMessages[1131] });
        return;
      }

      const updateResp = await dbService.update(
        'smoke',
        updatePayload,
        { where: { uuid: ctx.request.body.uuid }, individualHooks: true },
        {}
      );

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1132] });
        return;
      }

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n Smoke update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  toggleArchiveRecord: async (ctx) => {
    try {
      const updatePayload = {
        status: ctx.request.body.status,
      };

      const updateResp = await dbService.update(
        'smoke',
        updatePayload,
        { where: { uuid: ctx.request.body.uuids }, individualHooks: true },
        {}
      );

      if (!updateResp) {
        ctx.res.forbidden({ msg: responseMessages[1132] });
        return;
      }

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n smoke update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  deleteRecord: async (ctx) => {
    try {
      const updatePayload = {
        status: 'Inactive',
      };

      const updateResp = await dbService.update(
        'smoke',
        updatePayload,
        { where: { uuid: ctx.request.query.uuid }, individualHooks: true },
        {}
      );

      if (!updateResp || !updateResp[0]) {
        ctx.res.forbidden({ msg: responseMessages[1133] });
        return;
      }

      await diary.deleteTrackerRecord({ where: { smokeId: updateResp[1][0].uuid }, individualHooks: true });

      ctx.res.ok({ result: updateResp });
      return;
    } catch (error) {
      console.log('\n smoke delete error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getById: async (ctx) => {
    try {
      const findResp = await dbService.findOne('smoke', {
        where: { uuid: ctx.request.params.uuid, status: 'Active' },
      });

      if (!findResp) {
        ctx.res.notFound({ msg: responseMessages[1135] });
        return;
      }

      ctx.res.ok({ result: findResp });
      return;
    } catch (error) {
      console.log('\n smoke find error...', error);
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

      const { count, rows } = await dbService.findAndCountAll('smoke', findQuery);

      if (!rows) {
        ctx.res.notFound({ msg: responseMessages[1135] });
        return;
      }

      ctx.res.ok({ result: rows, count });
      return;
    } catch (error) {
      console.log('\n smoke find list error...', error);
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
        ],
      };

      const findData = await dbService.findAll('smoke', findQuery);

      ctx.res.ok({ result: findData });
      return;
    } catch (error) {
      console.log('\n smoke find list error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  syncFhir: async (ctx) => {
    try {
      const updatePromise = _.filter(ctx.request.body.fhirSyncArray || [], (innerData) => !innerData.deleted).map(
        (innerData) =>
          dbService.update('smoke', { fhirSynced: true, fhirId: innerData.fhirId }, { where: { id: innerData.id } }, {})
      );

      const idsToDelete = _.filter(ctx.request.body.fhirSyncArray || [], (innerData) => innerData.deleted).map(
        (innerData) => innerData.id
      );

      const updateResp = await Promise.all(updatePromise);
      const deletedResp = await dbService.destroy('smoke', { where: { id: { [Op.in]: idsToDelete } } });

      ctx.res.ok({ result: { updateResp, deletedResp } });
      return;
    } catch (error) {
      console.log('\n smoke fhir sync update error...', error);
      ctx.res.internalServerError({ error });
    }
  },
};
