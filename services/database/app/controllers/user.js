const alcohol = require('./alcohol');
const smoke = require('./smoke');
const pain = require('./pain');
const problem = require('./problem');
const sleep = require('./sleep');
const dbService = require('../services/db-service');
const { Sequelize } = require('../config/sequelize');
const commonService = require('../services/common-service');
const { uuidv4, moment, _ } = require('../services/imports');
const responseMessages = require('../middleware/response-messages');
const config = require('../config/config');

const { Op } = Sequelize;

const createUser = async (ctx, role) => {
  const userPayload = {
    uuid: uuidv4(),
    username: ctx.request.body.email,
    fhirId: ctx.request.body.fhirId,
    password: commonService.generateRandomNumber(8),
    email: ctx.request.body.email,
    firstName: ctx.request.body.firstName,
    mobileNumber: ctx.request.body.mobileNumber,
    loginType: 'normal',
    status: 'Active',
  };

  const userProfilePayload = {
    uuid: uuidv4(),
    userId: userPayload.uuid,
    centreId: ctx.request.body.centreId,
    team: ctx.request.body.team,
    type: ctx.request.body.type,
    access: ctx.request.body.access,
    createdBy: ctx.req.decoded.uuid,
  };

  const userExistCheckQuery = {
    where: {
      [Op.or]: [
        {
          email: userPayload.email,
        },
      ],
    },
    attributes: ['uuid'],
  };

  if (userPayload.mobileNumber) {
    userExistCheckQuery.where[Op.or].push({ mobileNumber: userPayload.mobileNumber });
  }

  const findRes = await dbService.findOne('user', userExistCheckQuery, {}, {});
  if (findRes) {
    return { error: { status: 409, msg: `${userPayload.mobileNumber ? 'Mobile or ' : ''}email already in use!` } };
  }

  let userSavedResp = await dbService.create('user', userPayload, {});
  userSavedResp = userSavedResp.toJSON();

  const profileSavedPromise = dbService.create('user_profile', userProfilePayload, {});

  const roleFindRes = await dbService.findOne('roles', { where: { name: role } });

  const roleSavedPromise = dbService.create(
    'user_role',
    { uuid: uuidv4(), userId: userSavedResp.uuid, roleId: roleFindRes.uuid },
    {}
  );

  const directorySettingsSavedPromise = dbService.create(
    'directory_settings',
    { uuid: uuidv4(), userId: userSavedResp.uuid, visible: true },
    {}
  );

  const userOtherDetailsSavedResp = await Promise.all([
    profileSavedPromise,
    roleSavedPromise,
    directorySettingsSavedPromise,
  ]);
  return {
    userOtherDetailsSavedResp,
    userSavedResp,
    userPayload,
    userProfilePayload,
  };
};

const communityUsersList = (ctx, roleArr = [], isAdmin = false, clinicianNameOnlySearch = false) => {
  console.log('roleArr', roleArr);
  const { offset, limit, sortArr } = commonService.paginationSortFilters(ctx);
  const dateCheck = [];
  if (ctx.request.query.fromDate) {
    dateCheck.push({
      createdAt: {
        [Op.gte]: commonService.indiaTz(ctx.request.query.fromDate).startOf('day'),
      },
    });
  }

  if (ctx.request.query.toDate) {
    dateCheck.push({
      createdAt: {
        [Op.lte]: commonService.indiaTz(ctx.request.query.toDate).endOf('day'),
      },
    });
  }
  if (ctx.request.query?.status) {
    dateCheck.push({
      status: ctx.request.query?.status
    });
  }
  const findQuery = {
    subQuery: false,
    offset,
    limit,
    order: [sortArr],
    where: {
      [Op.and]: [...dateCheck],
    },
    attributes: ['uuid', 'firstName', 'lastName', 'email', 'createdAt', 'nhsNumber', 'status'],
    include: [
      {
        required: true,
        model: 'user_role',
        as: 'userRole',
        include: [
          {
            model: 'roles',
            as: 'roleInfo',
            attributes: ['name'],
            where: {
              [Op.or]: roleArr.map((roleName) => ({ name: roleName })),
            },
          },
        ],
      },
      {
        model: 'user_profile',
        as: 'userProfile',
        required: false,
        attributes: ['uuid', 'team'],
        include: [{ model: 'centre', as: 'centre', required: false, attributes: ['name', 'uuid'] }],
      },
    ],
  };

  if (!isAdmin && !clinicianNameOnlySearch) {
    findQuery.include = [
      ...findQuery.include,
      {
        model: 'circle',
        as: 'connectFrom',
        required: false,
        attributes: ['uuid', 'fromId'],
      },
      {
        model: 'circle',
        as: 'connectTo',
        required: false,
        attributes: ['uuid', 'toId'],
      },
    ];
  }

  switch (ctx.request.query.filter) {
    case 'Active':
      findQuery.where[Op.and].push({ status: 'Active' });
      break;
    case 'Deactivated':
      findQuery.where[Op.and].push({ status: 'Deactivated' });
      break;
    default:
      findQuery.where[Op.and].push({ [Op.or]: [{ status: 'Active' }, { status: 'Deactivated' }] });
      break;
  }

  if (ctx.request.query.search) {
    if (isAdmin) {
      findQuery.where[Op.and].push({
        [Op.or]: [
          Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('user.firstName')),
            'LIKE',
            `%${(ctx.request.query.search || '').toLowerCase()}%`
          ),
          Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('user.lastName')),
            'LIKE',
            `%${(ctx.request.query.search || '').toLowerCase()}%`
          ),
          Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('userProfile.centre.name')),
            'LIKE',
            `%${(ctx.request.query.search || '').toLowerCase()}%`
          ),
          Sequelize.where(
            Sequelize.col('userProfile.team'),
            '?|',
            `{${(ctx.request.query.search || '').toLowerCase()}}`
          ),
        ],
      });
    }
    if (clinicianNameOnlySearch) {
      findQuery.where[Op.and].push({
        [Op.or]: [
          Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('user.firstName')),
            'LIKE',
            `%${(ctx.request.query.search || '').toLowerCase()}%`
          ),
          Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('user.lastName')),
            'LIKE',
            `%${(ctx.request.query.search || '').toLowerCase()}%`
          ),
          Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('user.email')),
            'LIKE',
            `%${(ctx.request.query.search || '').toLowerCase()}%`
          ),
        ],
      });
    }
    switch (Number(ctx.request.query.type)) {
      case 1:
        findQuery.where[Op.and].push({
          [Op.or]: [
            Sequelize.where(
              Sequelize.col('userProfile.team'),
              '?|',
              `{${(ctx.request.query.search || '').toLowerCase()}}`
            ),
            Sequelize.where(
              Sequelize.fn('LOWER', Sequelize.col('userProfile.centre.name')),
              'LIKE',
              `%${(ctx.request.query.search || '').toLowerCase()}%`
            ),
          ],
        });
        break;
      case 2:
        findQuery.where[Op.and].push({
          [Op.or]: [
            Sequelize.where(
              Sequelize.fn('LOWER', Sequelize.col('user.firstName')),
              'LIKE',
              `%${(ctx.request.query.search || '').toLowerCase()}%`
            ),
            Sequelize.where(
              Sequelize.fn('LOWER', Sequelize.col('user.lastName')),
              'LIKE',
              `%${(ctx.request.query.search || '').toLowerCase()}%`
            ),
            Sequelize.where(
              Sequelize.fn('LOWER', Sequelize.col('userProfile.centre.name')),
              'LIKE',
              `%${(ctx.request.query.search || '').toLowerCase()}%`
            ),
          ],
        });
        break;
      case 3:
        findQuery.where[Op.and].push({
          [Op.or]: [
            Sequelize.where(
              Sequelize.fn('LOWER', Sequelize.col('user.firstName')),
              'LIKE',
              `%${(ctx.request.query.search || '').toLowerCase()}%`
            ),
            Sequelize.where(
              Sequelize.fn('LOWER', Sequelize.col('user.lastName')),
              'LIKE',
              `%${(ctx.request.query.search || '').toLowerCase()}%`
            ),
            Sequelize.where(
              Sequelize.fn('LOWER', Sequelize.col('user.nhsNumber')),
              'LIKE',
              `%${(ctx.request.query.search || '').toLowerCase()}%`
            ),
          ],
        });
        break;
      case 4:
        findQuery.where[Op.and].push({
          [Op.or]: [
            Sequelize.where(
              Sequelize.fn('LOWER', Sequelize.col('user.firstName')),
              'LIKE',
              `%${(ctx.request.query.search || '').toLowerCase()}%`
            ),
            Sequelize.where(
              Sequelize.fn('LOWER', Sequelize.col('user.lastName')),
              'LIKE',
              `%${(ctx.request.query.search || '').toLowerCase()}%`
            ),
            Sequelize.where(
              Sequelize.fn('LOWER', Sequelize.col('user.nhsNumber')),
              'LIKE',
              `%${(ctx.request.query.search || '').toLowerCase()}%`
            ),
            Sequelize.where(
              Sequelize.fn('LOWER', Sequelize.col('userProfile.centre.name')),
              'LIKE',
              `%${(ctx.request.query.search || '').toLowerCase()}%`
            ),
            Sequelize.where(
              Sequelize.col('userProfile.team'),
              '?|',
              `{${(ctx.request.query.search || '').toLowerCase()}}`
            ),
            Sequelize.where(
              Sequelize.fn('LOWER', Sequelize.col('userProfile.centre.name')),
              'LIKE',
              `%${(ctx.request.query.search || '').toLowerCase()}%`
            ),
          ],
        });
        break;
    }
  }
  return findQuery;
};

const directoryUsersQuery = (ctx, roleArr = [], includeCentre = false, includeDirectory = false) => {
  const { offset, limit, sortArr } = commonService.paginationSortFilters(ctx);
  const findQuery = {
    offset,
    limit,
    order: [sortArr],
    attributes: [
      'firstName',
      'middleName',
      'lastName',
      'email',
      'uuid',
      [
        Sequelize.literal(`EXISTS(SELECT * FROM "circle" WHERE 
            ("circle"."toId" = "user"."uuid" OR "circle"."fromId" = "user"."uuid"))`),
        'userLinked',
      ],
    ],
    include: [
      {
        model: 'user_role',
        as: 'userRole',
        required: true,
        attributes: ['roleId', 'uuid'],
        include: [
          {
            model: 'roles',
            as: 'roleInfo',
            attributes: ['name', 'uuid'],
            where: { [Op.or]: roleArr.map((roleName) => ({ name: roleName })) },
          },
        ],
      },
      {
        model: 'user_profile',
        as: 'userProfile',
        required: false,
      },
    ],
    where: {
      uuid: { [Op.ne]: ctx.req.decoded.uuid },
      status: 'Active'
    },
  };

  if (ctx.request.query.search) {
    findQuery.where = {
      ...findQuery.where,
      [Op.or]: [
        // Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('email')), 'LIKE', '%' + ctx.request.query.search + '%'),
        Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('firstName')),
          'LIKE',
          `%${(ctx.request.query.search || '').toLowerCase()}%`
        ),
        {
          email: ctx.request.query.search,
        },
      ],
    };
  }

  if (includeCentre) {
    findQuery.include[1].include = [{ model: 'centre', as: 'centre', required: false }];
  }

  if (includeDirectory) {
    findQuery.include.push({
      model: 'directory_settings',
      as: 'directorySettings',
      required: true,
      where: { visible: true },
    });
  }

  if (ctx.request.query.centreId) {
    findQuery.include[1].required = true;
    findQuery.where[Op.and] = [Sequelize.where(Sequelize.col('userProfile.centreId'), ctx.request.query.centreId)];
    if (includeDirectory) {
      findQuery.where[Op.and].push(Sequelize.where(Sequelize.col('directorySettings.centre'), true));
    }
  }

  if (ctx.request.query.roleId) {
    findQuery.include[0].where = { roleId: ctx.request.query.roleId };
  }

  return findQuery;
};

const linkedPatientsQuery = (ctx) => {
  const searchId = ctx.request.query.userId;
  const findQuery = {
    where: {
      status: 'Active',
      // [Op.or]: [
      //     Sequelize.where(Sequelize.col('connectFrom.fromId'), searchId),
      //     Sequelize.where(Sequelize.col('connectFrom.toId'), searchId),
      //     Sequelize.where(Sequelize.col('connectTo.fromId'), searchId),
      //     Sequelize.where(Sequelize.col('connectTo.toId'), searchId),
      // ]
    },
    attributes: [
      'uuid',
      'firstName',
      'lastName',
      'email',
      [
        Sequelize.literal(`EXISTS(SELECT * FROM "circle" WHERE 
            (("circle"."toId" = '${searchId}' OR "circle"."fromId" = '${searchId}') AND 
            ("circle"."toId" = "user"."uuid" OR "circle"."fromId" = "user"."uuid")))`),
        'userLinked',
      ],
    ],
    include: [
      {
        required: true,
        model: 'user_role',
        as: 'userRole',
        attributes: ['uuid'],
        include: [
          {
            model: 'roles',
            as: 'roleInfo',
            attributes: ['name'],
            where: { name: config.roleNames.p },
          },
        ],
      },
      // {
      //     model: 'circle', as: 'connectFrom', required: false, attributes: ["fromId", "toId"],
      // },
      // {
      //     model: 'circle', as: 'connectTo', required: false, attributes: ["fromId", "toId"],
      // },
    ],
  };
  return findQuery;
};

const getWeeksDashboardData = (fromDate, toDate, responseArray, overviewKey) => {
  let daysHavingRecords = 0;
  const weekDates = commonService.getAllDates(fromDate, toDate, 'week');
  const yValues = weekDates.map((xData) => {
    const dateFindIdx = _.findIndex(responseArray, { date: xData });
    let overViewRate = 0;
    if (dateFindIdx != -1) {
      daysHavingRecords++;
      overViewRate = responseArray[dateFindIdx][overviewKey];
    }
    return commonService.roundDecimal(overViewRate);
  });
  const xValues = weekDates.map((dateValue) => moment(dateValue).format('DD/MM (ddd)'));
  const total = commonService.countArr(yValues, '');
  return { xValues, totalDays: weekDates.length, yValues, total, daysHavingRecords };
};
const getMonthsDashboardData = (monthDate, responseArray, overviewKey) => {
  const { weeksArr, weeksNumArr } = commonService.getAllWeeksFromMonth(monthDate);
  const xValues = weeksArr;
  const monthsCountArr = weeksNumArr.map((weeksData) => {
    const { total, daysHavingRecords } = getWeeksDashboardData(
      weeksData.start,
      weeksData.end,
      responseArray,
      overviewKey
    );
    return {
      totalCount: total,
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
  return { xValues, daysHavingRecords, yValues, total };
};
const getYearDashboardData = (yearDate, responseArray, overviewKey) => {
  const xValues = moment.monthsShort();
  const yearCountData = xValues.map((monthName) => {
    const monthStartDate = moment(`01-${monthName}-${moment(yearDate).format('YYYY')}`, 'DD-MMM-YYYY').format(
      'YYYY-MM-DD'
    );
    return getMonthsDashboardData(monthStartDate, responseArray, overviewKey);
  });
  const daysHavingRecords = commonService.countArr(
    yearCountData.map((countData) => countData.daysHavingRecords),
    ''
  );
  const yValues = yearCountData.map((innerData) =>
    commonService.roundDecimal(innerData.total / innerData.daysHavingRecords));
  return { xValues, yValues, daysHavingRecords };
};

const modifyChartRecords = async (type, fromDate, toDate, result, overviewKey) => {
  try {
    let xValues = [];
    let yValues = [];
    switch (type) {
      case 'week':
        ({ xValues, yValues } = getWeeksDashboardData(fromDate, toDate, result, overviewKey));
        break;
      case 'month':
        ({ xValues, yValues } = getMonthsDashboardData(fromDate, result, overviewKey));
        break;
      case 'year':
        ({ xValues, yValues } = getYearDashboardData(fromDate, result, overviewKey));
        break;
    }
    return { xValues, yValues };
  } catch (error) {
    console.log('\n response modify error...', error);
    return { xValues: [], yValues: [] };
  }
};

module.exports = {
  getTrackerOverview: async (ctx) => {
    try {
      const chartDataResp = { xValues: [], yValues: { alcohol: [], smoke: [], sleep: [], pain: {}, problem: {} } };
      const promiseArr = [];
      ctx.request.query.compareIds.split(',').forEach((element) => {
        if ((element || '').toLowerCase().startsWith('alcohol')) {
          promiseArr.push(
            alcohol.findChartRecords(
              ctx.request.query.fromDate,
              ctx.request.query.toDate,
              ctx.request.query.userId || ctx.req.decoded.uuid
            )
          );
        }
        if ((element || '').toLowerCase().startsWith('smoke')) {
          promiseArr.push(
            smoke.findChartRecords(
              ctx.request.query.fromDate,
              ctx.request.query.toDate,
              ctx.request.query.userId || ctx.req.decoded.uuid
            )
          );
        }
        if ((element || '').toLowerCase().startsWith('sleep')) {
          promiseArr.push(
            sleep.findChartRecords(
              ctx.request.query.fromDate,
              ctx.request.query.toDate,
              ctx.request.query.userId || ctx.req.decoded.uuid
            )
          );
        }
        if ((element || '').toLowerCase().startsWith('pain')) {
          element.split('pain_').forEach((innerElemId) => {
            if (innerElemId) {
              promiseArr.push(
                pain.findChartRecords(
                  ctx.request.query.fromDate,
                  ctx.request.query.toDate,
                  ctx.request.query.userId || ctx.req.decoded.uuid,
                  innerElemId
                )
              );
            }
          });
        }
        if ((element || '').toLowerCase().startsWith('problem')) {
          element.split('problem_').forEach((innerElemId) => {
            if (innerElemId) {
              promiseArr.push(
                problem.findChartRecords(
                  ctx.request.query.fromDate,
                  ctx.request.query.toDate,
                  ctx.request.query.userId || ctx.req.decoded.uuid,
                  innerElemId
                )
              );
            }
          });
        }
      });

      const chartDataRespArr = await Promise.all(promiseArr);
      chartDataRespArr.forEach(async (respObj) => {
        const overviewKeyJson = {
          alcohol: 'managedStatus',
          pain: 'overviewsRate',
          problem: 'managedStatus',
          sleep: 'managedStatus',
          smoke: 'managedStatus',
        };
        const modifiedResponse = await modifyChartRecords(
          ctx.request.query.type,
          ctx.request.query.fromDate,
          ctx.request.query.toDate,
          respObj.result,
          overviewKeyJson[respObj.chart]
        );
        switch (respObj.chart) {
          case 'pain':
          case 'problem':
            chartDataResp.xValues = modifiedResponse.xValues || [];
            chartDataResp.yValues[respObj.chart][respObj.id] = modifiedResponse.yValues || [];
            break;
          default:
            chartDataResp.xValues = modifiedResponse.xValues || [];
            chartDataResp.yValues[respObj.chart] = modifiedResponse.yValues || [];
            break;
        }
      });

      ctx.res.ok({ result: chartDataResp });
      return;
    } catch (error) {
      ctx.res.internalServerError({ error });
    }
  },
  updateProfile: async (ctx) => {
    try {
      const userUpdatePayload = {
        lastName: ctx.request.body.lastName,
        mobileNumber: ctx.request.body.mobileNumber,
      };
      const profileUpdatePayload = {
        userId: ctx.req.decoded.uuid,
        specialism: ctx.request.body.specialism,
        team: ctx.request.body.team,
        centreId: ctx.request.body.centreId,
        jobRole: ctx.request.body.jobRole,
        profilePic: ctx.request.body.profilePic,
        department: ctx.request.body.department,
        qualification: ctx.request.body.qualification,
        expertise: ctx.request.body.expertise,
      };

      const promiseArr = [
        dbService.update(
          'user',
          userUpdatePayload,
          { where: { uuid: ctx.req.decoded.uuid }, individualHooks: true },
          {}
        ),
        dbService.findOneAndUpsert(
          'user_profile',
          { where: { userId: ctx.req.decoded.uuid }, individualHooks: true },
          profileUpdatePayload,
          {}
        ),
      ];

      const updateResp = await Promise.all(promiseArr);

      ctx.res.ok({
        result: updateResp.map((innerData) => {
          let returnJson = innerData.insertRes || innerData.updateRes || innerData[1][0];
          if (returnJson) {
            returnJson = returnJson.toJSON();
          }
          delete returnJson.password;
          delete returnJson.accessToken;
          delete returnJson.refreshToken;
          return returnJson;
        }),
      });
      return;
    } catch (error) {
      ctx.res.internalServerError({ error });
    }
  },
  updateConsent: async (ctx) => {
    try {
      const userUpdatePayload = {
        consent: ctx.request.body.consent,
      };

      const updateResp = await dbService.update('user', userUpdatePayload, { where: { uuid: ctx.req.decoded.uuid } });

      ctx.res.ok({
        msg: 'Consent updated successfully',
      });
      return;
    } catch (error) {
      ctx.res.internalServerError({ error });
    }
  },
  getConsent: async (ctx) => {
    try {
      const data = await dbService.findOne('user', {
        where: {
          uuid: ctx.req.decoded.uuid,
        },
        attributes: ['consent'],
      });

      ctx.res.ok({
        result: data,
      });
      return;
    } catch (error) {
      ctx.res.internalServerError({ error });
    }
  },
  inActiveAccount: async (ctx) => {
    try {
      const userUpdatePayload = {
        status: 'deleted',
        // email: `${Date.now()}@deleted-account.com`
      };
      console.log(userUpdatePayload, 'userUpdatePayload');

      const updateResp = await dbService.update('user', userUpdatePayload, { where: { uuid: ctx.req.decoded.uuid } });

      ctx.res.ok({
        msg: 'Account deleted successfully',
      });
      return;
    } catch (error) {
      ctx.res.internalServerError({ error });
    }
  },
  deleteAccount: async (ctx) => {
    try {
      const updateResp = await dbService.destroy('user', { where: { uuid: ctx.req.decoded.uuid } });

      ctx.res.ok({
        msg: 'Account deleted successfully',
      });
      return;
    } catch (error) {
      ctx.res.internalServerError({ error });
    }
  },
  addResourceLibraryFavorite: async (ctx) => {
    try {
      const record = await dbService.findOne('user_resource_library', {
        where: {
          userId: ctx.req.decoded.uuid,
        },
        attributes: ['favorites', 'id'],
      });
      if (!record) {
        const payload = {
          userId: ctx.req.decoded.uuid,
          favorites: [
            {
              resource_id: ctx.request.body.resource_id,
              resource_type: ctx.request.body.resource_type,
            },
          ],
          preferences: [],
        };
        await dbService.create('user_resource_library', payload);
      } else if (ctx.request.body.action === 'remove') {
        let favs = JSON.parse(JSON.stringify(record.favorites));
        favs = favs.filter((f) => f.resource_id !== ctx.request.body.resource_id);
        record.favorites = favs;
        await record.save();
      } else {
        // only insert if the id is not yet present
        let favs = JSON.parse(JSON.stringify(record.favorites));
        favs = favs.filter((f) => f.resource_id !== ctx.request.body.resource_id);
        favs.push({
          resource_id: ctx.request.body.resource_id,
          resource_type: ctx.request.body.resource_type,
        });
        record.favorites = favs;
        await record.save();
      }

      ctx.res.ok({
        msg: 'Added resource to favorites',
      });
      return;
    } catch (error) {
      ctx.res.internalServerError({ error });
    }
  },
  updateResourceLibraryPreference: async (ctx) => {
    try {
      const record = await dbService.findOne('user_resource_library', {
        where: {
          userId: ctx.req.decoded.uuid,
        },
        attributes: ['preferences', 'id'],
      });
      const userUpdatePayload = {
        consent: ctx.request.body.consent,
      };
      if (!record) {
        const payload = {
          userId: ctx.req.decoded.uuid,
          favorites: [],
          preferences: ctx.request.body.preferences,
        };
        await dbService.create('user_resource_library', payload);
      } else {
        record.preferences = ctx.request.body.preferences;
        await record.save();
      }

      ctx.res.ok({
        msg: 'Preference saved',
      });
      return;
    } catch (error) {
      ctx.res.internalServerError({ error });
    }
  },
  fetchResourceLibrary: async (ctx) => {
    try {
      const record = await dbService.findOne('user_resource_library', {
        where: {
          userId: ctx.req.decoded.uuid,
        },
        attributes: ['preferences', 'favorites', 'uuid'],
      });

      ctx.res.ok({
        result: record,
      });
      return;
    } catch (error) {
      ctx.res.internalServerError({ error });
    }
  },
  fetchAuditTrails: async (ctx) => {
    try {
      const { offset, limit, sortArr } = commonService.paginationSortFilters(ctx);

      let searchWhereQuery = {};
      if (ctx.request.query.q) {
        searchWhereQuery = {
          [Op.or]: [
            { action: { [Op.iLike]: `%${ctx.request.query.q}%` } },
            { action_text: { [Op.iLike]: `%${ctx.request.query.q}%` } },
            { module_name: { [Op.iLike]: `%${ctx.request.query.q}%` } },
          ],
        };
      }
      const count = await dbService.count('audit_trail_logs', {
        where: {
          [Op.or]: [{ user_id: ctx.req.decoded.uuid }, { data_owner: ctx.req.decoded.uuid }],
          [Op.and]: {
            ...searchWhereQuery,
          },
        },
      });
      const records = await dbService.findAll('audit_trail_logs', {
        where: {
          [Op.or]: [{ user_id: ctx.req.decoded.uuid }, { data_owner: ctx.req.decoded.uuid }],
          [Op.and]: {
            ...searchWhereQuery,
          },
        },
        attributes: [
          'id',
          'user_id',
          'data_owner',
          'action',
          'action_text',
          'module_name',
          'action_date',
          'createdAt',
          'updatedAt',
        ],
        order: [sortArr],
        offset,
        limit,
        include: [
          {
            model: 'user',
            as: 'user_info',
            attributes: ['id', 'firstName', 'lastName'],
          },
          {
            model: 'user',
            as: 'data_owner_info',
            attributes: ['id', 'firstName', 'lastName'],
          },
        ],
      });

      ctx.res.ok({
        result: {
          records,
          count,
        },
      });
      return;
    } catch (error) {
      ctx.res.internalServerError({ error });
    }
  },
  updateAccountSettings: async (ctx) => {
    try {
      const settingsUpdatePayload = {
        userId: ctx.req.decoded.uuid,
        inAppNotification: ctx.request.body.inAppNotification,
        emailAppNotification: ctx.request.body.emailAppNotification,
        notifyPeriodCount: ctx.request.body.notifyPeriodCount,
        notifyPeriod: ctx.request.body.notifyPeriod,
      };

      const upsertResp = await dbService.findOneAndUpsert(
        'account_settings',
        { where: { userId: ctx.req.decoded.uuid }, individualHooks: true },
        settingsUpdatePayload,
        {}
      );

      ctx.res.ok({ result: upsertResp.insertRes || upsertResp.updateRes });
      return;
    } catch (error) {
      ctx.res.internalServerError({ error });
    }
  },
  updateDirectorySettings: async (ctx) => {
    try {
      const settingsUpdatePayload = {
        userId: ctx.req.decoded.uuid,
        visible: ctx.request.body.visible,
        centre: ctx.request.body.centre,
        associatedClinician: ctx.request.body.associatedClinician,
        mobileNumber: ctx.request.body.mobileNumber,
        specialism: ctx.request.body.specialism,
        qualification: ctx.request.body.qualification,
        expertise: ctx.request.body.expertise,
      };

      const upsertResp = await dbService.findOneAndUpsert(
        'directory_settings',
        { where: { userId: ctx.req.decoded.uuid }, individualHooks: true },
        settingsUpdatePayload,
        {}
      );

      ctx.res.ok({ result: upsertResp.insertRes || upsertResp.updateRes });
      return;
    } catch (error) {
      ctx.res.internalServerError({ error });
    }
  },
  getUsersFromDirectory: async (ctx) => {
    try {
      let roleArr = [];
      if (ctx.req.decoded.role == config.roleNames.a) {
        roleArr = [...roleArr, config.roleNames.a, config.roleNames.cl, config.roleNames.p, config.roleNames.ct];
      }
      if (ctx.req.decoded.role == config.roleNames.cl) {
        roleArr = [...roleArr, config.roleNames.cl, config.roleNames.p, config.roleNames.ct];
      }
      if (ctx.req.decoded.role == config.roleNames.p) {
        roleArr = [...roleArr, config.roleNames.p, config.roleNames.ct];
      }
      const findQuery = directoryUsersQuery(ctx, roleArr, true, true);

      const { rows, count } = await dbService.findAndCountAll('user', findQuery);

      ctx.res.ok({ result: rows, count });
      return;
    } catch (error) {
      ctx.res.internalServerError({ error });
    }
  },
  getPeoplesFromCircle: async (ctx) => {
    try {
      const findQuery = directoryUsersQuery(ctx, [config.roleNames.p]);

      const { rows, count } = await dbService.findAndCountAll('user', findQuery);

      ctx.res.ok({ result: rows, count });
      return;
    } catch (error) {
      ctx.res.internalServerError({ error });
    }
  },
  getColleguesFromCircle: async (ctx) => {
    try {
      const findQuery = directoryUsersQuery(ctx, [ctx.req.decoded.role], true);

      const { rows, count } = await dbService.findAndCountAll('user', findQuery);

      ctx.res.ok({ result: rows, count });
      return;
    } catch (error) {
      ctx.res.internalServerError({ error });
    }
  },
  createAdminUser: async (ctx) => {
    try {
      const { error = null, userSavedResp = null, userProfilePayload } = await createUser(ctx, config.roleNames.a);

      if (error) {
        ctx.res.conflict({ msg: error.msg });
        return;
      }

      ctx.res.ok({
        result: {
          uuid: userSavedResp.uuid,
          username: userSavedResp.username,
          firstName: userSavedResp.firstName,
          mobileNumber: userSavedResp.mobileNumber,
          email: userSavedResp.email,
          team: userProfilePayload.team,
          type: userProfilePayload.type,
          modules: userProfilePayload.modules,
        },
      });
      return;
    } catch (error) {
      if (error.error && error.error.name === 'SequelizeUniqueConstraintError') {
        ctx.res.conflict({ msg: error.error.message });
        return;
      }
      ctx.res.internalServerError({ error });
    }
  },
  createCareTeam: async (ctx) => {
    try {
      const profileFindResp = await dbService.findOne('user_profile', {
        where: { userId: ctx.req.decoded.uuid },
        attributes: ['uuid', 'access'],
      });

      if (!profileFindResp.access || !profileFindResp.access.createUsers.caresTeam.add) {
        ctx.res.forbidden({ msg: responseMessages[1146] });
        return;
      }

      const {
        error = null,
        userSavedResp = null,
        userProfilePayload,
        userPayload,
      } = await createUser(ctx, config.roleNames.ct);

      if (error) {
        ctx.res.conflict({ msg: error.msg });
        return;
      }

      const teamArray = ctx.request.body.teams || [];
      if (teamArray && teamArray.length) {
        const teamNamesToFind = teamArray.map((teamName) => teamName.toLowerCase());
        let teamsFindArr = await dbService.findAll('careteam_teams', {
          where: { teamName: { [Op.in]: teamNamesToFind } },
          attributes: ['teamName', 'uuid'],
        });
        teamsFindArr = teamsFindArr.map((teamData) => teamData.toJSON());

        const teamArrayToSave = teamNamesToFind
          .filter((el) => !teamsFindArr.some((f) => f.teamName == el))
          .map((teamName) => ({ teamName }));
        let teamCreationArray = [];
        if (teamArrayToSave.length) {
          teamCreationArray = await dbService.bulkCreate('careteam_teams', teamArrayToSave, {});
          teamCreationArray = teamCreationArray.map((teamData) => teamData.toJSON());
        }

        const teamGroupArray = [...teamCreationArray, ...teamsFindArr].map((teamData) => ({
          userId: userPayload.uuid,
          teamId: teamData.uuid,
        }));

        await dbService.bulkCreate('careteam_user_groups', teamGroupArray, { ignoreDuplicates: true });
      }

      ctx.res.ok({
        result: {
          uuid: userSavedResp.uuid,
          username: userSavedResp.username,
          firstName: userSavedResp.firstName,
          mobileNumber: userSavedResp.mobileNumber,
          email: userSavedResp.email,
          team: userProfilePayload.team,
          type: userProfilePayload.type,
          access: userProfilePayload.access,
        },
      });
      return;
    } catch (error) {
      console.log('\n care teams create error...', error);
      if (error.error && error.error.name === 'SequelizeUniqueConstraintError') {
        ctx.res.conflict({ msg: error.error.message });
        return;
      }
      ctx.res.internalServerError({ error });
    }
  },
  createClinician: async (ctx) => {
    try {
      const profileFindResp = await dbService.findOne('user_profile', {
        where: { userId: ctx.req.decoded.uuid },
        attributes: ['uuid', 'access'],
      });
      if (!profileFindResp.access || !profileFindResp.access.createUsers.clinicians.add) {
        ctx.res.forbidden({ msg: responseMessages[1147] });
        return;
      }

      const { error = null, userSavedResp = null, userProfilePayload } = await createUser(ctx, config.roleNames.cl);

      if (error) {
        ctx.res.conflict({ msg: error.msg });
        return;
      }

      ctx.res.ok({
        result: {
          uuid: userSavedResp.uuid,
          username: userSavedResp.username,
          firstName: userSavedResp.firstName,
          mobileNumber: userSavedResp.mobileNumber,
          email: userSavedResp.email,
          team: userProfilePayload.team,
          type: userProfilePayload.type,
        },
      });
      return;
    } catch (error) {
      if (error.error && error.error.name === 'SequelizeUniqueConstraintError') {
        ctx.res.conflict({ msg: error.error.message });
        return;
      }
      ctx.res.internalServerError({ error });
    }
  },
  createPatient: async (ctx) => {
    try {
      const profileFindResp = await dbService.findOne('user_profile', {
        where: { userId: ctx.req.decoded.uuid },
        attributes: ['uuid', 'access'],
      });

      if (!profileFindResp.access || !profileFindResp.access.createUsers.patients.add) {
        ctx.res.forbidden({ msg: responseMessages[1148] });
        return;
      }

      const { error = null, userSavedResp = null, userProfilePayload } = await createUser(ctx, config.roleNames.p);

      if (error) {
        ctx.res.conflict({ msg: error.msg });
        return;
      }

      ctx.res.ok({
        result: {
          uuid: userSavedResp.uuid,
          username: userSavedResp.username,
          firstName: userSavedResp.firstName,
          mobileNumber: userSavedResp.mobileNumber,
          email: userSavedResp.email,
          team: userProfilePayload.team,
          type: userProfilePayload.type,
        },
      });
      return;
    } catch (error) {
      if (error.error && error.error.name === 'SequelizeUniqueConstraintError') {
        ctx.res.conflict({ msg: error.error.message });
        return;
      }
      ctx.res.internalServerError({ error });
    }
  },
  getPatientsToLinkUnlink: async (ctx) => {
    try {
      const findQuery = linkedPatientsQuery(ctx);
      const allPatients = await dbService.findAll('user', findQuery);
      ctx.res.ok({ result: allPatients });
      return;
    } catch (error) {
      console.log('\n getPatientsToLinkUnlink error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getCommunityUsers: async (ctx) => {
    try {
      let findQuery = {};
      switch (Number(ctx.request.query.type)) {
        case 1:
          findQuery = communityUsersList(ctx, [config.roleNames.ct]);
          break;
        case 2:
          findQuery = communityUsersList(ctx, [config.roleNames.cl]);
          break;
        case 3:
          findQuery = communityUsersList(ctx, [config.roleNames.p]);
          break;
        case 4:
          findQuery = communityUsersList(ctx, [config.roleNames.ct, config.roleNames.cl, config.roleNames.p]);
          break;
      }

      const { count, rows } = await dbService.findAndCountAll('user', findQuery);

      ctx.res.ok({ count, result: rows });
      return;
    } catch (error) {
      ctx.res.internalServerError({ error });
    }
  },
  getUserByRole: async (ctx) => {
    try {
      ctx.request.query = JSON.parse(JSON.stringify(ctx.request.query));
      const users = await dbService.findAll('user', {
        include: [
          {
            model: 'user_role',
            as: 'userRole',
            include: [
              {
                model: 'roles',
                as: 'roleInfo',
                nested: true,
                required: true,
                where: {
                  name: ctx.request.query.role.split(',').length > 0 ? ctx.request.query.role.split(',') : ctx.request.query.role,
                },
              },
            ],
            required: true,
          },
        ],
        attributes: ['uuid', 'firstName', 'lastName', 'email', 'status'],
        where: {
          uuid: { [Op.ne]: ctx.req.decoded.uuid },
        },
      });

      const finalArray = _.map(users, (u) => {
        const t = {
          id: u.uuid,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          status: u.status,
          role: u.userRole && u.userRole.roleInfo.name ? u.userRole.roleInfo.name : null,
          subRole: null,
        };
        return t;
      });

      return ctx.res.ok({
        result: finalArray,
      });
    } catch (error) {
      return ctx.res.internalServerError({ error });
    }
  },
  linkClinicianAndPatients: async (ctx) => {
    try {
      const circleArray = (ctx.request.body.linkArray || []).map((circleData) => ({
        ...circleData,
        inviteCode: commonService.generateRandomNumber(),
        connectedBy: ctx.req.decoded.uuid,
      }));

      let circleCreationArray = [];
      if (circleArray && circleArray.length) {
        circleCreationArray = await dbService.bulkCreate('circle', circleArray, {});
      }

      return ctx.res.ok({ result: { circleCreatedList: circleCreationArray } });
    } catch (error) {
      return ctx.res.internalServerError({ error });
    }
  },
  checkClinicianAvailable: async (ctx) => {
    try {
      const isClinicianExistQuery = {
        where: {
          uuid: {
            [Op.in]: ctx.request.body.clinicianIds,
          },
        },
        include: [
          {
            required: true,
            model: 'user_role',
            as: 'userRole',
            attributes: ['id'],
            include: [
              {
                model: 'roles',
                as: 'roleInfo',
                attributes: ['name'],
                where: { name: config.roleNames.cl },
              },
            ],
          },
        ],
        attributes: ['uuid'],
      };
      const clinicianList = await dbService.findAll('user', isClinicianExistQuery);
      return ctx.res.ok({ result: clinicianList });
    } catch (error) {
      console.log('\n ctx.request.body.clinicianIds...', ctx.request.body.clinicianIds);
      console.log('\n checkClinicianAvailable error...', error);
      return ctx.res.internalServerError({ error });
    }
  },
  checkPatientsAvailable: async (ctx) => {
    try {
      const patientExistQuery = {
        where: {
          uuid: {
            [Op.in]: ctx.request.body.patientIds,
          },
        },
        include: [
          {
            required: true,
            model: 'user_role',
            as: 'userRole',
            attributes: ['id'],
            include: [
              {
                model: 'roles',
                as: 'roleInfo',
                attributes: ['name'],
                where: { name: config.roleNames.p },
              },
            ],
          },
        ],
        attributes: ['uuid', 'firstName', 'lastName', 'email'],
      };
      const patientList = await dbService.findAll('user', patientExistQuery);
      ctx.res.ok({ result: patientList });
      return;
    } catch (error) {
      console.log('\n checkPatientsAvailable error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  checkCareteamAvailable: async (ctx) => {
    try {
      const findQuery = {
        where: {
          uuid: ctx.request.body.careteamId,
        },
        attributes: ['uuid'],
      };
      const careteam = await dbService.findOne('careteam_teams', findQuery);
      ctx.res.ok({ result: careteam });
      return;
    } catch (error) {
      ctx.res.internalServerError({ error });
    }
  },
  getAllAdmin: async (ctx) => {
    try {
      const findQuery = communityUsersList(ctx, [config.roleNames.a], true);
      const { count, rows } = await dbService.findAndCountAll('user', findQuery);
      ctx.res.ok({ count, result: rows });
      return;
    } catch (error) {
      ctx.res.internalServerError({ error });
    }
  },
  listCareteams: async (ctx) => {
    try {
      const { limit, offset, sortArr } = commonService.paginationSortFilters(ctx);

      const findQuery = {
        offset,
        limit,
        order: [sortArr],
        include: [
          {
            model: 'careteam_user_groups',
            as: 'careTeamUserGroups',
            required: false,
            attributes: ['uuid', 'userId'],
          },
        ],
        attributes: ['uuid', 'teamName', 'createdAt'],
      };

      if (ctx.request.query.search) {
        findQuery.where[Op.and] = [
          Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('teamName')),
            'LIKE',
            `%${(ctx.request.query.search || '').toLowerCase()}%`
          ),
        ];
      }

      const { count, rows } = await dbService.findAndCountAll('careteam_teams', findQuery);

      ctx.res.ok({ count, result: rows });
      return;
    } catch (error) {
      console.log('error.........', error);
      ctx.res.internalServerError({ error });
    }
  },

  listUsersInCareteam: async (ctx) => {
    try {
      const { sortArr } = commonService.paginationSortFilters(ctx);

      const findQuery = {
        // offset,
        // limit,
        order: [sortArr],
        where: {
          teamId: ctx.request.query.teamId,
        },
        include: [
          {
            model: 'user',
            as: 'userInfo',
            required: true,
            attributes: ['uuid', 'firstName', 'lastName', 'email'],
          },
        ],
        attributes: ['uuid', 'userId', 'createdAt'],
      };

      if (ctx.request.query.search) {
        findQuery.where[Op.and] = [
          {
            [Op.or]: [
              Sequelize.where(
                Sequelize.fn('LOWER', Sequelize.col('user.firstName')),
                'LIKE',
                `%${(ctx.request.query.search || '').toLowerCase()}%`
              ),
              Sequelize.where(
                Sequelize.fn('LOWER', Sequelize.col('user.lastName')),
                'LIKE',
                `%${(ctx.request.query.search || '').toLowerCase()}%`
              ),
              Sequelize.where(
                Sequelize.fn('LOWER', Sequelize.col('user.email')),
                'LIKE',
                `%${(ctx.request.query.search || '').toLowerCase()}%`
              ),
            ],
          },
        ];
      }

      const { count, rows } = await dbService.findAndCountAll('careteam_user_groups', findQuery);

      ctx.res.ok({ count, result: rows });
      return;
    } catch (error) {
      console.log('\n listUsersInCareteam error...', error);
      ctx.res.internalServerError({ error });
    }
  },

  getAllClinicians: async (ctx) => {
    try {
      ctx.request.query.pageSize = 100;
      const findQuery = communityUsersList(ctx, [config.roleNames.cl], false, true);
      const { count, rows } = await dbService.findAndCountAll('user', findQuery);
      ctx.res.ok({ count, result: rows });
      return;
    } catch (error) {
      console.log('\n admin community user get error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getAllCliniciansAndAdmin: async (ctx) => {
    try {
      const findQuery = communityUsersList(ctx, ctx.request.query?.role == 'All' ? [config.roleNames.cl, config.roleNames.a] : [ctx.request.query.role], true);
      const { count, rows } = await dbService.findAndCountAll('user', findQuery);
      ctx.res.ok({ count, result: rows });
      return;
    } catch (error) {
      console.log('\n admin community user get error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  removeUserCircleConnection: async (ctx) => {
    try {
      let circleList = await dbService.findAll('circle', {
        where: {
          uuid: { [Op.in]: ctx.request.body.circleIds },
          status: 'accepted',
        },
        attributes: ['uuid'],
      });
      if (circleList.length === 0) {
        ctx.res.unprocessableEntity({ msg: responseMessages[1145] });
        return;
      }
      circleList = circleList.map((circleData) => circleData.toJSON());

      await dbService.update(
        'circle',
        {
          status: 'revoked',
          revokedBy: ctx.req.decoded.uuid,
        },
        { where: { uuid: { [Op.in]: circleList.map((circleData) => circleData.uuid) } }, individualHooks: true }
      );

      ctx.res.ok({ msg: responseMessages[1141] });
      return;
    } catch (error) {
      console.log('\n Connections remove error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  removeUserFromCareTeam: async (ctx) => {
    try {
      let careTeams = await dbService.findAll('careteam_user_groups', {
        where: {
          userId: { [Op.in]: ctx.request.body.userIds },
          teamId: ctx.request.body.teamId,
        },
        attributes: ['uuid'],
      });
      if (careTeams.length === 0) {
        ctx.res.unprocessableEntity({ msg: responseMessages[1145] });
        return;
      }
      careTeams = careTeams.map((circleData) => circleData.toJSON());

      await dbService.destroy('careteam_user_groups', {
        where: {
          userId: { [Op.in]: ctx.request.body.userIds },
          teamId: ctx.request.body.teamId,
        },
        attributes: ['uuid'],
      });

      ctx.res.ok({ msg: responseMessages[1142] });
      return;
    } catch (error) {
      console.log('\n care team users remove error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  linkCareteamsAndPatients: async (ctx) => {
    try {
      const circleArray = ctx.request.body.linkArray;
      const updatedInviteCodeAndAdminId = circleArray.map((v) => ({
        ...v,
        inviteCode: commonService.generateRandomNumber(),
        connectedBy: ctx.req.decoded.uuid,
      }));
      await dbService.bulkCreate('circle', updatedInviteCodeAndAdminId);
      ctx.res.ok({ msg: responseMessages[1143] });
      return;
    } catch (error) {
      console.log('error........', error);
      ctx.res.internalServerError({ error });
    }
  },
  unLinkCareteamsAndPatients: async (ctx) => {
    try {
      const removedCircleIds = ctx.request.body.patientIds;
      const deletedPayload = removedCircleIds.map((v) => ({
        teamId: ctx.request.body.teamId,
        toId: v,
      }));
      const deleteQuery = { where: { [Op.or]: deletedPayload } };
      await dbService.destroy('circle', deleteQuery);
      ctx.res.ok({ msg: responseMessages[1149] });
    } catch (error) {
      console.log('error........', error);
      ctx.res.internalServerError({ error });
    }
  },
  deactivateUsers: async (ctx) => {
    try {
      let usersList = await dbService.findAll('user', {
        where: {
          uuid: { [Op.in]: ctx.request.body.userIds },
          status: 'Active',
        },
        attributes: ['uuid'],
      });
      if (usersList.length === 0) {
        ctx.res.unprocessableEntity({ msg: responseMessages[1145] });
        return;
      }
      usersList = usersList.map((userData) => userData.toJSON());

      await dbService.update(
        'user',
        {
          status: 'Deactivated',
        },
        {
          where: { uuid: { [Op.in]: usersList.map((userData) => userData.uuid) } },
          individualHooks: true,
        }
      );
      await dbService.update(
        'user_profile',
        {
          updatedBy: ctx.req.decoded.uuid,
        },
        {
          where: { userId: { [Op.in]: usersList.map((userData) => userData.uuid) } },
          individualHooks: true,
        }
      );

      ctx.res.ok({ msg: responseMessages[1144] });
      return;
    } catch (error) {
      console.log('\n users deactivate error...', error);
      ctx.res.internalServerError({ error });
    }
  },

  getCareTeamCircles: async (ctx) => {
    try {
      const careteamCircles = await dbService.findAll('circle', { where: { teamId: ctx.request.body.careteamId } });
      ctx.res.ok({ result: careteamCircles });
    } catch (error) {
      console.log('\n users deactivate error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getUserCountRoleWise: async (ctx) => {
    try {
      const clinician = await dbService.count('user_role', {
        include: [
          {
            model: 'roles',
            as: 'roleInfo',
            attributes: ['name'],
            where: {
              name: config.roleNames.cl
            },
            required: true,
          },
        ],
      });
      const patient = await dbService.count('user_role', {
        include: [
          {
            model: 'roles',
            as: 'roleInfo',
            attributes: ['name'],
            where: {
              name: config.roleNames.p
            },
            required: true,
          },
        ],
      });
      const admin = await dbService.count('user_role', {
        include: [
          {
            model: 'roles',
            as: 'roleInfo',
            attributes: ['name'],
            where: {
              name: config.roleNames.a
            },
            required: true,
          },
        ],
      });

      ctx.res.ok({ result: { clinician, patient, admin } });
      return;
    } catch (error) {
      console.log('\n group find error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  checkEmailExist: async (ctx) => {
    try {
      // check email exist in user table or not
      const user = await dbService.findOne('user', {
        where: {
          email: ctx.request.body.email,
        },
      });
      if (user) {
        ctx.res.ok({ result: { userExist: true } });
        return;
      }
      return ctx.res.ok({ result: { userExist: false } });
    } catch (error) {
      console.log('\n users deactivate error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getInvitedUsers: async (ctx) => {
    try {
      let status; let
        relationship = {};
      if (ctx.request.body?.status) {
        status = { status: ctx.request.body.status };
      }
      if (ctx.request.body?.relationship?.length > 0) {
        relationship = {
          relationship: {
            [Op.in]: ctx.request.body.relationship
          }
        };
      }

      const userInvitesPromise = await dbService.findAll('invite', {
        where: {
          fromId: ctx.req.decoded.uuid,
          ...status,
          ...relationship
        },
        attributes: ['uuid', 'relationship', 'email', 'status', 'createdAt', 'fromId', 'toId', 'firstName', 'lastName'],
        include: [
          {
            model: 'user_module',
            as: 'userModule',
          },
        ],
      });
      console.log('userInvitesPromise', userInvitesPromise);

      ctx.res.ok({ result: userInvitesPromise });
    } catch (error) {
      console.log('\n users deactivate error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  updateUserModule: async (ctx) => {
    try {
      // find user module
      const userModule = await dbService.findOne('user_module', {
        where: {
          createdBy: ctx.req.decoded.uuid,
          uuid: ctx.request.body.userModuleId,
        },
      });
      if (!userModule) {
        return ctx.res.unprocessableEntity({ msg: responseMessages[1188] });
      }
      // update user module
      await dbService.update(
        'user_module',
        {
          status: ctx.request.body.status,
          permission: ctx.request.body.permission,
        },
        {
          where: { uuid: ctx.request.body.userModuleId },
        }
      );

      ctx.res.ok({ result: 'sucess' });
    } catch (error) {
      console.log('\n users deactivate error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  getRoles: async (ctx) => {
    try {
      const where = {};
      if (ctx.request.query?.permissionStatus) {
        where.permissionStatus = ctx.request.query.permissionStatus;
      }
      // find roles
      const roles = await dbService.findAll('roles', {
        where
      });
      return ctx.res.ok({ result: roles });
    } catch (error) {
      console.log('\n users deactivate error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  updateRolePermission: async (ctx) => {
    try {
      // find role
      const role = await dbService.findOne('roles', {
        where: {
          uuid: ctx.request.body.uuid,
        },
      });
      if (!role) {
        return ctx.res.notFound({ msg: 'role not found' });
      }
      // update role
      await dbService.update(
        'roles',
        {
          permission: ctx.request.body.permission,
          permissionStatus: ctx.request.body.permissionStatus,
        },
        {
          where: { uuid: ctx.request.body.uuid },
        }
      );

      ctx.res.ok({ result: 'sucess' });
    } catch (error) {
      console.log('\n users deactivate error...', error);
      ctx.res.internalServerError({ error });
    }
  },

  // User Role Scope
  getUserRoleScopeById: async (ctx) => {
    try {
      const where = { roleId: ctx.request.params.roleId };
      // find role Scope
      const roleScope = await dbService.findOne('role_scope', {
        where
      });
      return ctx.res.ok({ result: roleScope });
    } catch (error) {
      console.log('\n users deactivate error...', error);
      ctx.res.internalServerError({ error });
    }
  },
  updateUserRoleScope: async (ctx) => {
    try {
      // find role
      const role = await dbService.findOne('roles', {
        where: {
          uuid: ctx.request.body.roleId,
        },
      });
      if (!role) {
        return ctx.res.notFound({ msg: 'role not found' });
      }

      const roleScope = await dbService.findOne('role_scope', {
        where: {
          roleId: ctx.request.body.roleId,
        },
      });
      if (!roleScope) {
        // Create new role scope
        await dbService.create('role_scope', {
          uuid: uuidv4(),
          roleId: ctx.request.body.roleId,
          roleScope: ctx.request.body.roleScope,
          status: ctx.request.body.status
        });
      } else {
        // update role
        await dbService.update(
          'role_scope',
          {
            roleScope: ctx.request.body.roleScope,
            status: ctx.request.body.status
          },
          {
            where: { roleId: ctx.request.body.roleId },
          }
        );
      }

      ctx.res.ok({ result: 'sucess' });
    } catch (error) {
      console.log('\n users deactivate error...', error);
      ctx.res.internalServerError({ error });
    }
  }

};
