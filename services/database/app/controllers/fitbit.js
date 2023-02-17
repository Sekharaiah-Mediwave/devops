const commonService = require('../services/common-service');
const dbService = require('../services/db-service');
const { _, moment, uuidv4, SHA256, crypto } = require('../services/imports');
const { Sequelize } = require('../config/sequelize');
const Op = Sequelize.Op;
const responseMessages = require('../middleware/response-messages');
const request = require('../middleware/axios-request');
const constants = require("../config/variableConstants");

const config = require("../config/config");
const fitbitBaseApiVersion = '1.2';

const fitBitBasicToken = () => {
    const basicAuth = Buffer.from(`${config.fitbit.clientId}:${config.fitbit.clientSecret}`).toString('base64');
    return basicAuth;
}
module.exports = {
    getFitBitParameters: async function (ctx) {
        try {
            let { userId } = ctx.request.query;
            const currentUser = ctx.req?.decoded;
            if (currentUser?.role === 'Patient') {
                userId = currentUser.uuid;
            }
            const { codeVerifier, codeChallange } = await commonService.generateCodeChallengeAndVerifier();

            const bitfitQueryParameters = {
                clientId: config.fitbit.clientId,
                scope: config.fitbit.scope,
                redirectUrl: config.fitbit.redirectUrl,
                authorizationUrl: config.fitbit.authorizationUrl,
                codeChallenge: codeChallange,
                codeVerifier: codeVerifier,
            };
            const payload = {
                userId,
                codeChallenge: bitfitQueryParameters.codeChallenge,
                codeVerifier: bitfitQueryParameters.codeVerifier
            }

            const AlreadyExist = await dbService.findOne('fit_bit', { where: { userId }, raw: true });
            let upsertData;
            if (AlreadyExist) {

                upsertData = await dbService.update('fit_bit', payload, { where: { userId } });
            } else if (userId && currentUser?.role === 'Patient') {
                upsertData = await dbService.create('fit_bit', payload);
            }
            for (const queryParameters in bitfitQueryParameters) {
                if (bitfitQueryParameters[queryParameters]) {
                    bitfitQueryParameters[queryParameters] = await commonService.hmacHashCipher(bitfitQueryParameters[queryParameters])
                }
            }

            ctx.res.ok({ result: bitfitQueryParameters });
            return;
        } catch (error) {
            console.log('\n FITBIT Parameters list error...', error);
            ctx.res.internalServerError({ error });

            return;
        }
    },
    fitBitOauth2Token: async function (ctx) {
        try {
            let upsertData;

            const bodyData = ctx.request.body;
            let { userId } = ctx.request.query;
            const currentUser = ctx.req?.decoded;
            if (currentUser?.role === 'Patient') {
                userId = currentUser.uuid;
            }
            let responseData = await request.post(ctx,
                `${config.fitbit.refreshTokenUrl}?client_id=${config.fitbit.clientId}&code=${bodyData.code}&code_verifier=${bodyData.codeVerifier}&grant_type=authorization_code`,
                {}, {
                headers: {
                    'Authorization': `Basic ${fitBitBasicToken()}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            responseData = responseData?.data;
            if (responseData) {

                const payload = {
                    fitbitUserId: responseData.user_id,
                    refreshToken: responseData.refresh_token,
                    accessToken: responseData.access_token,
                    tokenUpdatedBy: userId,
                    scope: responseData.scope,
                    tokenCreatedAt: new Date()
                };
                const AlreadyExist = await dbService.findOne('fit_bit', { where: { userId } });

                if (AlreadyExist) {
                    upsertData = await dbService.update('fit_bit', payload, { where: { userId } });
                } else {
                    upsertData = await dbService.create('fit_bit', payload);
                }
                ctx.res.ok({ result: {}, msg: responseMessages[1159] });
                return;
            } else {
                ctx.res.notFound({ msg: responseMessages[1158] });
                return;
            }

        } catch (error) {
            console.log('\n ERROR: Fitbit Oauth2 Token...', error);
            ctx.res.internalServerError({ error });
            return;
        }

    },
    getFitBitSleepGoal: async function (ctx) {
        let { userId } = ctx.request.query;
        const currentUser = ctx.req?.decoded;
        if (currentUser?.role === 'Patient') {
            userId = currentUser.uuid;
        }

        await request.get(ctx,
            `${config.fitbit.baseUrl}/${fitbitBaseApiVersion}/user/-/sleep/goal.json`,
            {
                headers: {
                    ...ctx.request.fitBitAccessToken,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        ).then(responseData => {
            ctx.res.ok({ result: responseData?.data });
            return;
        }).catch(error => {
            console.log('\n FITBIT getFitBitSleepGoal list error...', error.error);
            ctx.res.internalServerError({ error });
            return;
        })
    },
    getFitBitSleepLogByDateRange: async function (ctx) {
        let { userId, startDate, endDate, type = 'month' } = ctx.request.query;
        const currentUser = ctx.req?.decoded;

        if (currentUser?.role === 'Patient') {
            userId = currentUser.uuid;
        }

        let toDate = commonService.indiaTz(endDate).format('YYYY-MM-DD');
        if (startDate) {
            fromDate = commonService.indiaTz(startDate).format('YYYY-MM-DD');
        }
        if (endDate) {
            toDate = commonService.indiaTz(endDate).format('YYYY-MM-DD');
        }
        let sleepSimpleData = constants.fitbitSleepSimple;
        await request.get(ctx,
            `${config.fitbit.baseUrl}/${fitbitBaseApiVersion}/user/-/sleep/date/${fromDate}/${toDate}.json`,
            {
                headers: {
                    ...ctx.request.fitBitAccessToken,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        ).then(async responseData => {
            let responseResult = { sleep: [] }
            let responseData_ = responseData?.data ? responseData.data : { sleep: [] };
            let i = 0;

            let noOfDateDiff = commonService.indiaTz(toDate).diff(commonService.indiaTz(fromDate), 'days', true)
            for (let date = 0; date <= noOfDateDiff; date++) {
                let newDate = commonService.indiaTz(fromDate).add(date, 'days').format('YYYY-MM-DD');
                let match = responseData_?.sleep?.length > 0 ? _.filter(responseData_?.sleep, s => s.dateOfSleep == newDate) : []
                if (match.length) {
                    responseResult.sleep.push({ ...match[0] });
                }
                else {
                    sleepSimpleData.dateOfSleep = newDate;
                    sleepSimpleData.endTime = newDate;
                    sleepSimpleData.levels.data[0].dateTime = newDate;
                    sleepSimpleData.startTime = newDate;
                    responseResult.sleep.push({ ...sleepSimpleData })
                }
                i++;
            }

            // const convertedData = await commonService.convertMonthlySleepData(responseResult, fromDate, toDate);

            responseResult[`${type}AverageSleepData`] = await commonService.convertAverageSleepData(responseResult);
            ctx.res.ok({ result: responseResult });
            return;
        }).catch(error => {
            console.log('\n FITBIT getFitBitSleepLogByDateRange error...', error);
            ctx.res.unauthorized({ msg: error?.error?.errors[0]?.message ? error?.error?.errors[0]?.message : error });
            return;
        })
    },
    getFitBitSleepLogByDate: async function (ctx) {
        let { userId } = ctx.request.query;

        const currentUser = ctx.req?.decoded;
        if (currentUser?.role === 'Patient') {
            userId = currentUser.uuid;
        }
        const date = ctx.request.query?.date || moment().format('YYYY-MM-DD');

        await request.get(ctx,
            `${config.fitbit.baseUrl}/${fitbitBaseApiVersion}/user/-/sleep/date/${date}.json`,
            {
                headers: {
                    ...ctx.request.fitBitAccessToken,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        ).then(async responseData => {
            const convertedData = await commonService.convertTodaySleepData(responseData?.data);
            if (convertedData?.sleep) {
                let durationInMilliseconds = convertedData?.sleep?.duration;
                let tempTime = moment.duration(durationInMilliseconds);
                convertedData.sleep.durationInHrs = `${tempTime?.hours()}:${tempTime?.minutes()}`;
            }
            ctx.res.ok({ result: responseData?.data });
            return;
        }).catch(error => {
            console.log('\n FITBIT getFitBitSleepLogByDate...', error);
            ctx.res.unauthorized({ msg: error?.error?.errors[0]?.message ? error?.error?.errors[0]?.message : error });
            return;
        })
    },

    getFitBitStepByDate: async function (ctx) {
        let { userId } = ctx.request.query;

        const currentUser = ctx.req?.decoded;
        if (currentUser?.role === 'Patient') {
            userId = currentUser.uuid;
        }
        const date = ctx.request.query?.date || moment().format('YYYY-MM-DD');

        await request.get(ctx,
            `${config.fitbit.baseUrl}/${fitbitBaseApiVersion}/user/-/activities/date/${date}.json`,
            {
                headers: {
                    ...ctx.request.fitBitAccessToken,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        ).then(async responseData => {
            const convertedData = await commonService.covertTodayStepData(responseData?.data);
            ctx.res.ok({ result: convertedData });
            return;
        }).catch(error => {
            console.log('\n Error: FITBIT getFitBitStepByDate list...', error?.error?.errors ? error?.error?.errors : error);
            ctx.res.unauthorized({ msg: error?.error?.errors[0]?.message ? error?.error?.errors[0]?.message : error });
            return;
        })
    },
    getFitBitStepByDateRange: async function (ctx) {

        let { userId, startDate, endDate, type } = ctx.request.query;
        const currentUser = ctx.req?.decoded;
        if (currentUser?.role === 'Patient') {
            userId = currentUser.uuid;
        }
        let toDate = moment(endDate).format('YYYY-MM-DD');
        let fromDate = moment(toDate, 'YYYY-MM-DD').subtract(3, 'month').format('YYYY-MM-DD');
        if (startDate) {
            fromDate = moment(startDate).format('YYYY-MM-DD');
        }
        if (endDate) {
            toDate = moment(endDate).format('YYYY-MM-DD');
        }

        await request.get(ctx,
            `${config.fitbit.baseUrl}/${fitbitBaseApiVersion}/user/-/activities/tracker/steps/date/${fromDate}/${toDate}.json`,
            {
                headers: {
                    ...ctx.request.fitBitAccessToken,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        ).then(async responseData => {
            // const convertedData = await commonService.convertMonthlyStepData(responseData?.data['activities-tracker-steps'], fromDate, toDate);
            ctx.res.ok({ result: responseData?.data });
            return;
        }).catch(error => {
            console.log('\n FITBIT Parameters list error...', error);
            ctx.res.unauthorized({ msg: error?.error?.errors[0]?.message ? error?.error?.errors[0]?.message : error });
            return;
        })
    },
    savedFitbit: async function (ctx) {
        const currentUser = ctx.req?.decoded;
        let userId = currentUser.uuid;
        try {
            const savePayload = {
                appName: ctx.request.body?.appName,
                status: ctx.request.body.status,
            };

            const findResp = await dbService.findOne('authenticated_apps', {
                where: {
                    userId,
                    appName: savePayload.appName
                },
            });

            if (findResp?.status === savePayload.status) {
                ctx.res.conflict({ msg: responseMessages[1160].replace("{{action}}", savePayload.status) });
                return;
            }
            let upsert = null;
            if (findResp?.id) {
                upsert = await dbService.update('authenticated_apps', savePayload, {
                    where: {
                        id: findResp?.id,
                    },
                });
                if (upsert?.length && upsert[0] == 0) {
                    ctx.res.forbidden({ msg: responseMessages[1162] });
                    return;
                }
            } else {
                upsert = await dbService.create('authenticated_apps', { ...savePayload, userId });
                if (!upsert) {
                    ctx.res.forbidden({ msg: responseMessages[1162] });
                    return;
                }
            }

            ctx.res.ok({ result: upsert });
            return;
        } catch (error) {
            console.log('\n diary save error...', error);
            ctx.res.internalServerError({ error });
            return;
        }
    },
    disconnected: async function (ctx) {
        const currentUser = ctx.req?.decoded;
        let userId = currentUser.uuid;
        const token = ctx.request.fitBitAccessToken.Authorization.split(' ')[1];
        const fitbitUserId = ctx.request.fitBitAccessToken?.fitbitUserId;
        await request.post(ctx,
            `${config.fitbit.baseUrl}/oauth2/revoke?token=${token}`,
            {}, {
            headers: {
                ...ctx.request.fitBitAccessToken,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(async responseData => {
            ctx.request.body = {
                appName: 'fit-bit',
                status: 'disconnected',
            }
            if (responseData.status === 200) {
                let condition = {};
                try {
                    let foundAllUser = await dbService.findAll('fit_bit', { where: { fitbitUserId }, raw: true, attributes: ['userId', 'fitbitUserId', 'tokenCreatedAt', 'refreshToken', 'id', 'accessToken'] });

                    if (foundAllUser.length > 1) {
                        let userIds = _.map(foundAllUser, (u) => u.userId);
                        condition = { where: { fitbitUserId: fitbitUserId } };
                        let bulkUpdate = await dbService.update('authenticated_apps', {
                            appName: 'fit-bit',
                            status: 'disconnected'
                        }, {
                            where: {
                                userId: userIds,
                                appName: 'fit-bit'
                            },
                        });
                        console.log('.....bulkUpdate...', bulkUpdate)
                    } else {
                        condition = { where: { userId: userId } };
                        await module.exports.savedFitbit(ctx);
                    }
                    await dbService.destroy('fit_bit', condition);
                } catch (error) {
                    console.log('\n Failed: Update and destroy Fitbit datae...', error);
                    ctx.res.forbidden({ error });
                    return;
                }

                ctx.res.ok({ result: {}, msg: responseMessages[1164] });
                return;
            }
            ctx.res.ok({ result: {}, msg: responseMessages[1164] });
            return;
        }).catch(error => {
            console.log('\n FITBIT Parameters list error...', error);
            ctx.res.unauthorized({ msg: error?.error?.errors[0]?.message ? error?.error?.errors[0]?.message : error });
            return;
        })
    },
};
