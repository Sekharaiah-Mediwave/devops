const { momentTz, fs, _, bcrypt, jwt, randomstring, axios, crypto, pkceChallenge } = require('./imports');
const config = require('../config/config');

const moment = momentTz;

const saltRounds = config.paswwordHashSaltRound ? Number(config.paswwordHashSaltRound) || 10 : 10;

const resizedIV = Buffer.allocUnsafe(16);
const iv = crypto
  .createHash('sha256')
  .update(config.cryptoKey)
  .digest();

iv.copy(resizedIV);

const key = crypto
  .createHash('sha256')
  .update(config.cryptoKey)
  .digest();

const roundDecimal = (num = 0, digits = 2) => Math.round((num * Number(`1${'0'.repeat(digits)}`)) || 0) / Number((`1${'0'.repeat(digits)}` || 0) || 0);

const getAllWeeksFromMonth = (dateValue, toDate = null) => {
  const firstWeekEnd = moment(dateValue).startOf('month').endOf('week');
  let lastWeekStart = moment(dateValue).endOf('month').startOf('week');
  if (toDate) {
    lastWeekStart = moment(toDate).endOf('month').startOf('week');
  }
  const weeksArr = [`${moment(dateValue).startOf('month').format('D')}-${firstWeekEnd.format('D')} ${firstWeekEnd.format('MMM')}`,];
  const weeksNumArr = [{ start: moment(dateValue).startOf('month').format('YYYY-MM-DD'), end: firstWeekEnd.format('YYYY-MM-DD'), },];
  let innerWeek = firstWeekEnd.add(1, 'day');
  while (lastWeekStart.toDate().getTime() > innerWeek.toDate().getTime()) {
    weeksArr.push(
      `${innerWeek.startOf('week').format('D')}-${innerWeek.endOf('week').format('D')} ${innerWeek.format('MMM')}`
    );
    weeksNumArr.push({
      start: innerWeek.startOf('week').format('YYYY-MM-DD'),
      end: innerWeek.endOf('week').format('YYYY-MM-DD'),
    });
    innerWeek = innerWeek.add(1, 'day');
  }
  weeksArr.push(
    `${lastWeekStart.startOf('week').format('D')}-${lastWeekStart.endOf('month').format('D')} ${lastWeekStart.format(
      'MMM'
    )}`
  );
  weeksNumArr.push({
    start: lastWeekStart.startOf('week').format('YYYY-MM-DD'),
    end: lastWeekStart.endOf('month').format('YYYY-MM-DD'),
  });
  return { weeksArr, weeksNumArr };
};

const getAllDates = (startDate, endDate, type) => {
  /* getting all dates between start and end date */
  try {
    if (type === 'week') {
      /* if type week then get all dates */
      const retVal = [];
      let start = moment(startDate).toDate();
      let end = moment(endDate).toDate();
      const newend = end.setDate(end.getDate());
      end = moment(newend).toDate();
      while (start <= end) {
        const tempMonth = `${start.getMonth() + 1}`;
        const tempDate = `${start.getDate()}`;
        retVal.push(
          `${start.getFullYear()}-${tempMonth.length === 2 ? tempMonth : `0${tempMonth}`}-${tempDate.length === 2 ? tempDate : `0${tempDate}`
          }`
        );
        const newDate = start.setDate(start.getDate() + 1);
        start = moment(newDate).toDate();
      }
      return retVal;
    }
    if (type === 'year') {
      /* if years, then get months instead of dates */
      const start = startDate.split('-');
      const end = endDate.split('-');
      const startYear = Number(start[0]);
      const endYear = Number(end[0]);
      const dates = [];
      for (let i = startYear; i <= endYear; i++) {
        const endMonth = i !== endYear ? 11 : Number(end[1]) - 1;
        const startMon = i === startYear ? Number(start[1]) - 1 : 0;
        for (let j = startMon; j <= endMonth; j = j > 12 ? j % 12 || 11 : j + 1) {
          const month = j + 1;
          const displayMonth = month < 10 ? `0${month}` : month;
          dates.push(moment(displayMonth, 'MM').format('MMM'));
        }
      }
      return dates;
    }
    return [];
  } catch (error) {
    return [];
  }
};
const countArr = (arrToCount = [], countObjKey = '') => {
  if (arrToCount.length > 0 && countObjKey) {
    return arrToCount.reduce((a, b) => a + (b[countObjKey] || 0), 0);
  }
  if (arrToCount.length > 0 && !countObjKey) {
    return arrToCount.reduce((a, b) => a + b, 0);
  }
  return 0;
};

const getWeeksDashboardData = (fromDate, toDate, responseArray, overviewJsonKey, overviewNumberKey) => {
  let daysHavingRecords = 0;
  const weekDates = getAllDates(fromDate, toDate, 'week');
  const managedOverview = [];
  const yValues = weekDates.map((xData) => {
    const dateFindIdx = _.findIndex(responseArray, { date: xData });
    let totalUnits = 0;
    if (dateFindIdx != -1) {
      daysHavingRecords++;
      managedOverview.push(roundDecimal(responseArray[dateFindIdx][overviewNumberKey]));
      for (const key in responseArray[dateFindIdx][overviewJsonKey]) {
        if (responseArray[dateFindIdx][overviewJsonKey][key]) {
          totalUnits += roundDecimal(responseArray[dateFindIdx][overviewJsonKey][key]);
        }
      }
    } else {
      managedOverview.push(0);
    }
    return roundDecimal(totalUnits);
  });
  const xValues = weekDates.map((dateValue) => moment(dateValue).format('DD/MM (ddd)'));
  // const xValues = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const total = roundDecimal(countArr(yValues, ''));
  const totalManagedOverview = roundDecimal(countArr(managedOverview));
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
const getMonthsDashboardData = (monthDate, responseArray, overviewJsonKey, overviewNumberKey) => {
  const { weeksArr, weeksNumArr } = getAllWeeksFromMonth(monthDate);
  const xValues = weeksArr;
  const monthsCountArr = weeksNumArr.map((weeksData) => {
    const { totalDays, total, managedOverview, daysHavingRecords, totalManagedOverview } = getWeeksDashboardData(
      weeksData.start,
      weeksData.end,
      responseArray,
      overviewJsonKey,
      overviewNumberKey
    );
    return { totalDays, totalCount: total, managedOverview, daysHavingRecords, totalManagedOverview };
  });
  const daysHavingRecords = countArr(
    monthsCountArr.map((countData) => countData.daysHavingRecords),
    ''
  );
  const total = roundDecimal(
    countArr(
      monthsCountArr.map((countData) => countData.totalCount),
      ''
    )
  );
  const yValues = monthsCountArr.map((innerData) => roundDecimal(innerData.totalCount / innerData.daysHavingRecords));
  const managedOverview = monthsCountArr.map((innerData) =>
    roundDecimal(countArr(innerData.managedOverview) / innerData.daysHavingRecords));
  const totalManagedOverview = roundDecimal(
    countArr(monthsCountArr.map((innerData) => innerData.totalManagedOverview))
  );
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

const getYearDashboardData = (yearDate, responseArray, overviewJsonKey, overviewNumberKey) => {
  const xValues = moment.monthsShort();
  const yearCountData = xValues.map((monthName) => {
    const monthStartDate = moment(`01-${monthName}-${moment(yearDate).format('YYYY')}`, 'DD-MMM-YYYY').format(
      'YYYY-MM-DD'
    );
    return getMonthsDashboardData(monthStartDate, responseArray, overviewJsonKey, overviewNumberKey);
  });
  const daysHavingRecords = countArr(
    yearCountData.map((countData) => countData.daysHavingRecords),
    ''
  );
  const total = roundDecimal(
    countArr(
      yearCountData.map((countData) => countData.total),
      ''
    )
  );
  const managedOverview = yearCountData.map((innerData) =>
    roundDecimal(innerData.totalManagedOverview / innerData.daysHavingRecords));
  const totalManagedOverview = roundDecimal(countArr(yearCountData.map((innerData) => innerData.totalManagedOverview)));
  const yValues = yearCountData.map((innerData) => roundDecimal(innerData.total / innerData.daysHavingRecords));
  return {
    xValues,
    yValues,
    total,
    managedOverview,
    totalManagedOverview,
    daysHavingRecords,
  };
};

module.exports = {
  generateCodeChallengeAndVerifier: async () => {
    const { code_verifier, code_challenge } = pkceChallenge();
    return { codeVerifier: code_verifier, codeChallange: code_challenge };
  },
  hmacHashCipher: (string) => {
    const cipher = crypto.createCipheriv('aes256', key, resizedIV);
    let encrypted = cipher.update(string, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  },
  hmacHashDecipher: (string) => {
    const decipher = crypto.createDecipheriv('aes256', key, resizedIV);
    let decrypted = decipher.update(string, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  },
  sumValuesInObject: (obj) => (obj && Object.keys(obj).length && Object.values(obj).reduce((a, b) => a + b)) || 0,
  setHeaders: (headersData, headerKeys = []) => {
    if (headersData) {
      let returnHeaders = {};
      if (headerKeys.length) {
        headerKeys.forEach((headerKeyName) => {
          returnHeaders = { ...returnHeaders, [headerKeyName]: headersData[headerKeyName] };
        });
        headersData = returnHeaders;
      }
      return {
        headers: headersData
      };
    }
    return undefined;
  },
  generateRandomNumber: (length = 6, charset = 'alphanumeric') => randomstring.generate({ length, charset }),
  token: async (payload, tokenType) => {
    const tokenConfig = {
      access: {
        expiresIn: config.accessTokenExpiry || '1 days',
        key: 'user-token:',
      },
      refresh: {
        expiresIn: config.refreshTokenExpiry || '30 days',
        key: 'user-refresh-token:',
      },
    };
    const jwtToken = jwt.sign(payload, config.jwtSecret, { expiresIn: tokenConfig[tokenType].expiresIn });
    try {
      if (payload.uuid) {
        await axios.post(`${config.redisUrl}/cache/set`, {
          value: jwtToken,
          key: `${tokenConfig[tokenType].key}${payload.uuid}`,
        });
      }
    } catch (error) {
      console.log('\n redis user token save error...', error);
    }
    return jwtToken;
  },
  base64Encode: (filepath) => fs.readFileSync(filepath, { encoding: 'base64' }),
  indiaTz: (date) => {
    if (!date) {
      return moment().tz('Asia/Kolkata');
    }
    return moment(moment(date).toDate()).tz('Asia/Kolkata');
  },
  checkDateValid: (dateVar) => {
    if (dateVar instanceof Date || moment.isMoment(dateVar)) {
      return true;
    }
    const parsedDate = Date.parse(dateVar);
    return isNaN(dateVar) && !isNaN(parsedDate);
  },
  compareDates: (dateVar1, dateVar2, condition) => {
    if (condition == 'greater') {
      return moment(dateVar1).toDate().getTime() > moment(dateVar2).toDate().getTime();
    }
    if (condition == 'lesser') {
      return moment(dateVar1).toDate().getTime() < moment(dateVar2).toDate().getTime();
    }
    if (condition == 'equal') {
      return moment(dateVar1).toDate().getTime() == moment(dateVar2).toDate().getTime();
    }
    if (condition == 'gteq') {
      return moment(dateVar1).toDate().getTime() >= moment(dateVar2).toDate().getTime();
    }
    if (condition == 'lteq') {
      return moment(dateVar1).toDate().getTime() <= moment(dateVar2).toDate().getTime();
    }
    return moment(dateVar1).toDate().getTime() > moment(dateVar2).toDate().getTime();
  },
  hashPassword: (password) =>
    new Promise((resolve, reject) => {
      if (password) {
        bcrypt.genSalt(saltRounds, (saltError, salt) => {
          if (saltError) {
            reject(saltError);
          } else {
            bcrypt.hash(password, salt, (hashError, hash) => {
              if (hashError) {
                reject(hashError);
              } else {
                resolve(hash);
              }
            });
          }
        });
      } else {
        resolve(null);
      }
    }),
  comparePassword: (enteredPassword, hashedPassword) =>
    new Promise((resolve, reject) => {
      bcrypt.compare(enteredPassword, hashedPassword, (error, isMatch) => {
        if (error) {
          reject(error);
        } else if (!isMatch) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    }),
  createAndSignBearerToken: ({ clientId, audience, uuid, privateKeyFilePath, privateKey }) => {
    if (!privateKey && !privateKeyFilePath) {
      throw new Error('No privateKey or privateKeyFilePath passed to createAndSignBearerToken');
    }
    // Read the private key
    privateKey = privateKey || fs.readFileSync(privateKeyFilePath);
    // Set the payload for the bearer-token to be sent to the /token nhs-login endpoint
    // note that the 'exp' key is ommitted here in favour of 'expiresIn' in jwt.sign() below
    const tokenPayload = {
      sub: clientId,
      iss: clientId,
      aud: audience,
      jti: uuid,
    };
    // return the signed token
    return jwt.sign(tokenPayload, privateKey, {
      algorithm: 'RS512',
      expiresIn: 60,
    });
  },
  enumerateDaysBetweenDates: (startDate, endDate) => {
    startDate = moment(startDate);
    endDate = moment(endDate);

    const now = startDate;
    const dates = [];

    while (now.isBefore(endDate) || now.isSame(endDate)) {
      dates.push(now.format('YYYY-MM-DD'));
      now.add(1, 'days');
    }
    return dates;
  },
  paginationSortFilters: (ctx) => {
    let pageNo = 1;
    const pageSize = ctx.request.query.pageSize ? Number(ctx.request.query.pageSize) : 10;
    let sortArr = ['createdAt', 'DESC'];
    let fieldSplitArr = [];

    if (ctx.request.query.pageNo) {
      const temp = parseInt(ctx.request.query.pageNo);
      if (temp && !isNaN(temp)) {
        pageNo = (temp - 1);
      }
    }

    const offset = (pageNo ? (pageNo - 1) : pageNo) * pageSize;

    if (ctx.request.query.sortField) {
      fieldSplitArr = ctx.request.query.sortField.split('.');
      if (fieldSplitArr.length == 1) {
        sortArr[0] = ctx.request.query.sortField;
      } else {
        for (let idx = 0; idx < fieldSplitArr.length; idx++) {
          const element = fieldSplitArr[idx];
          fieldSplitArr[idx] = element.replace(/\[\/?.+?\]/gi, '');
        }
        sortArr = fieldSplitArr;
      }
    }

    if (ctx.request.query.sortOrder) {
      if (fieldSplitArr.length == 1 || fieldSplitArr.length == 0) {
        sortArr[1] = ctx.request.query.sortOrder;
      } else {
        sortArr.push(ctx.request.query.sortOrder);
      }
    }
    return { pageNo, offset, sortArr, limit: pageSize };
  },
  covertTodayStepData: (stepData) => {
    const returnObj = {
      steps: 0,
      stepsInPercentage: '--percent: 0',
      distance: 0,
      distanceInPercentage: '--percent: 0',
      calories: 0,
      caloriesInPercentage: '--percent: 0',
      activeMinutes: 0
    };
    try {
      console.log(stepData.goals, '..........stepData.goals......', stepData.goals.distance);
      const totalDistance = parseInt(stepData.goals.distance * 1000);
      const completedDistance = parseInt(stepData.summary.distance * 1000);
      returnObj.steps = stepData.summary.steps;
      returnObj.distance = stepData.summary.distance;
      returnObj.calories = stepData.summary.calories.total;
      const caloriesInPercentage = parseInt((100 * returnObj.calories) / stepData.goals.calories);
      const stepsInPercentage = parseInt((100 * returnObj.steps) / stepData.goals.steps);
      const distanceInPercentage = parseInt((100 * completedDistance) / totalDistance);
      returnObj.caloriesInPercentage = `--percent: ${caloriesInPercentage > 100 ? 100 : caloriesInPercentage}`;
      returnObj.stepsInPercentage = `--percent: ${stepsInPercentage > 100 ? 100 : stepsInPercentage}`;
      returnObj.distanceInPercentage = `--percent: ${distanceInPercentage > 100 ? 100 : distanceInPercentage}`;
      if (stepData.summary && stepData.summary.activityLevels && stepData.summary.activityLevels.length) {
        const { activityLevels } = stepData.summary;
        returnObj.activeMinutes = activityLevels[1].minutes + activityLevels[2].minutes + activityLevels[3].minutes;
      }
      return returnObj;
    } catch (error) {
      console.log('findSleepDataBetweenDates error...........', error);
      return [];
    }
  },
  convertMonthlySleepData: async (sleepData, fromDate, toDate) => {
    const { weeksArr, weeksNumArr } = module.exports.getAllWeeksFromMonth(fromDate, toDate);
    const finalObj = {
      weeksArr,
      sleepData: [],
      total: []
    };
    const returnObj = {
      weekNames: [],
      sleepRecords: [],
      total: []
    };
    try {
      if (sleepData.sleep.length === 0) {
        return returnObj;
      }
      weeksNumArr.map((date, index) => {
        const foundSleepData = module.exports.findSleepDataBetweenDates(sleepData.sleep, date.start, date.end);
        finalObj.sleepData[index] = foundSleepData;
      });

      finalObj.weeksArr.map((weekName, index) => {
        const isCurrentWeek = moment().startOf('week').isSame(weeksNumArr[index].start, 'week');
        const isLastWeek = moment().subtract(1, 'week').startOf('week').isSame(weeksNumArr[index].start, 'week');
        const sleepRecords = finalObj.sleepData[index] || [];
        const tempWeekName = isCurrentWeek ? 'This week' : (isLastWeek ? 'Last week' : weekName);
        if (sleepRecords.length > 0 || tempWeekName === 'This week') {
          returnObj.weekNames.push(tempWeekName);
          returnObj.sleepRecords.push(sleepRecords);
          const average = _.sumBy(sleepRecords, 'minutesAsleep');
          returnObj.total.push(average);
        }
      });
      returnObj.weekNames = returnObj.weekNames.reverse();
      returnObj.sleepRecords = returnObj.sleepRecords.reverse();
      returnObj.total = returnObj.total.reverse();
      return returnObj;
    } catch (error) {
      console.log('convertMonthlySleepData error...........', error);
      return returnObj;
    }
  },
  findSleepDataBetweenDates: (sleepData, fromDate, toDate) => {
    try {
      let foundDatas = sleepData.map((sleep) => {
        const isBetweenDates = moment(sleep.dateOfSleep).isBetween(fromDate, toDate, null, '[]'); // true
        if (isBetweenDates && sleep.isMainSleep) {
          return sleep;
        }
      });
      foundDatas = _.compact(foundDatas);
      return foundDatas;
    } catch (error) {
      console.log('findSleepDataBetweenDates error...........', error);
      return [];
    }
  },
  convertAverageSleepData: (sleepData) => {
    const returnObj = { deep: 0, wake: 0, light: 0, rem: 0 };
    if (sleepData.sleep.length === 0) {
      return null;
    }

    returnObj.deep = _.sum(_.map(sleepData.sleep, (s) => {
      let deepMin = 0;
      if (s.type === 'stages') {
        deepMin = s.levels.summary.deep.minutes;
      }
      return deepMin;
    }));
    // returnObj.wake = _.sum(_.map(sleepData.sleep, 'levels.summary.wake.minutes'));
    returnObj.wake = _.sum(_.map(sleepData.sleep, (s) => {
      let wakeMin = 0;
      if (s.type === 'stages') {
        wakeMin = s.levels.summary.wake.minutes;
      }
      return wakeMin;
    }));
    // returnObj.light = _.sum(_.map(sleepData.sleep, 'levels.summary.light.minutes'));
    returnObj.light = _.sum(_.map(sleepData.sleep, (s) => {
      let lightMin = 0;
      if (s.type === 'stages') {
        lightMin = s.levels.summary.light.minutes;
      }
      return lightMin;
    }));

    // returnObj.rem = _.sum(_.map(sleepData.sleep, 'levels.summary.rem.minutes'));
    returnObj.rem = _.sum(_.map(sleepData.sleep, (s) => {
      let remMin = 0;
      if (s.type === 'stages') {
        remMin = s.levels.summary.rem.minutes;
      }
      return remMin;
    }));

    // returnObj.timeInBed = _.sum(_.map(sleepData.sleep, 'timeInBed'));
    returnObj.timeInBed = _.sum(_.map(sleepData.sleep, (s) => {
      let remMin = 0;
      if (s.type === 'stages') {
        remMin = s.timeInBed;
      }
      return remMin;
    }));
    for (const key in returnObj) {
      if (returnObj[key] != 'timeInBed') {
        returnObj[`${key}Percentage`] = +((100 * returnObj[key]) / returnObj.timeInBed) ? +((100 * returnObj[key]) / returnObj.timeInBed) : 0;
      }
    }

    return returnObj;
  },
  findStepDataBetweenDates: (stepData, fromDate, toDate) => {
    try {
      let foundDatas = stepData.map((step) => {
        const isBetweenDates = moment(step.dateTime).isBetween(fromDate, toDate, null, '[]');
        if (isBetweenDates) {
          return step;
        }
      });
      foundDatas = _.compact(foundDatas);
      return foundDatas;
    } catch (error) {
      console.log('findSleepDataBetweenDates error...........', error);
      return [];
    }
  },
  convertMonthlyStepData: async (stepData, fromDate, toDate) => {
    const { weeksArr, weeksNumArr } = getAllWeeksFromMonth(fromDate, toDate);
    const finalObj = {
      weeksArr,
      stepData: []
    };
    try {
      if (stepData.length === 0) {
        return finalObj;
      }
      const nonEmptyData = _.filter(stepData, (obj) => obj.value !== '0');
      weeksNumArr.map((date, index) => {
        const foundSleepData = module.exports.findStepDataBetweenDates(nonEmptyData, date.start, date.end);
        finalObj.stepData[index] = foundSleepData;
      });
      const returnObj = {
        weekNames: [],
        stepRecords: [],
        total: []
      };
      finalObj.weeksArr.map((weekName, index) => {
        const stepRecords = finalObj.stepData[index] || [];
        const isCurrentWeek = moment().startOf('week').isSame(weeksNumArr[index].start, 'week');
        const isLastWeek = moment().subtract(1, 'week').startOf('week').isSame(weeksNumArr[index].start, 'week');
        const tempWeekName = isCurrentWeek ? 'This week' : (isLastWeek ? 'Last week' : weekName);
        if (stepRecords.length > 0 || tempWeekName === 'This week') {
          returnObj.weekNames.push(tempWeekName);
          returnObj.stepRecords.push(stepRecords.reverse());
          const totalSteps = _.sum(_.map(stepRecords, 'value').map(Number));
          returnObj.total.push(parseInt(totalSteps));
        }
      });
      returnObj.weekNames = returnObj.weekNames.reverse();
      returnObj.stepRecords = returnObj.stepRecords.reverse();
      returnObj.total = returnObj.total.reverse();
      return returnObj;
    } catch (error) {
      console.log('convertMonthlySleepData error...........', error);
      return finalObj;
    }
  },
  convertWeeklyStepData: (stepData, fromDate, toDate) => {
    const returnObj = {
      weekLabel: `${moment(fromDate).format('DD')} ${moment(fromDate).format('MMMM')} - ${moment(toDate).format('DD')} ${moment(toDate).format('MMMM')} ${moment(toDate).format('YYYY')}`,
      chartPoints: {
        xAxis: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        yAxis: [0, 0, 0, 0, 0, 0, 0]
      }
    };
    if (stepData.length === 0) {
      return returnObj;
    }
    returnObj.chartPoints = module.exports.convertStepChartDataPoints(stepData);
    return returnObj;
  },

  convertStepChartDataPoints: (dataPoints) => {
    const convertedDataPoints = dataPoints.map((sleep) => ({
      x: moment(sleep.dateTime).format('ddd'),
      y: sleep.value
    }));
    return {
      xAxis: _.map(convertedDataPoints, 'x'),
      yAxis: _.map(convertedDataPoints, 'y')
    };
  },
  convertToChartDataPoints: (dataPoints) => {
    console.log('...convertToChartDataPoints...');
    const levelPoints = {
      wake: 7,
      rem: 5,
      light: 3,
      deep: 1,
      awake: 6,
      restless: 4,
      asleep: 2
    };
    const convertedDataPoints = dataPoints.map((sleep) => ({
      x: moment(sleep.dateTime).format('HH:mm'),
      y: levelPoints[sleep.level]
    }));
    return {
      xAxis: _.map(convertedDataPoints, 'x'),
      yAxis: _.map(convertedDataPoints, 'y')
    };
  },
  convertTodaySleepData: (sleepData) => {
    const returnObj = {
      chartPoints: {
        xAxis: ['00:00', '00:01', '00:02', '00:03', '00:04', '00:05', '00:06', '00:07', '00:08'],
        yAxis: [0, 0, 0, 0, 0, 0, 0, 0, 0]

      }
    };
    if (sleepData.sleep.length === 0) {
      return returnObj;
    }
    returnObj.sleep = _.find(sleepData.sleep, { isMainSleep: true });

    returnObj.chartPoints = module.exports.convertToChartDataPoints(returnObj.sleep.levels.data);
    returnObj.summary = sleepData.summary;
    return returnObj;
  },
  getAllWeeksFromMonth,
  getAllDates,
  countArr,
  getWeeksDashboardData,
  getMonthsDashboardData,
  getYearDashboardData,
  roundDecimal,
};
