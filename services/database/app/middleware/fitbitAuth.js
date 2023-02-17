
const config = require("../config/config");
const request = require("./axios-request");
const { moment, _ } = require("../services/imports");
const dbService = require('../services/db-service');
const commonService = require('../services/common-service');

module.exports = {

    getFitbitAuthToken: () => async (ctx, next) => {
        let { userId } = ctx.request.query;
        const currentUser = ctx.req?.decoded;
        if (currentUser?.role === 'Patient') {
            userId = currentUser.uuid;
        }
        try {
            const fitBitData = await dbService.findOne('fit_bit', { where: { userId }, raw: true, attributes: ['userId', 'fitbitUserId', 'tokenCreatedAt', 'refreshToken', 'id', 'accessToken'] });

            if (fitBitData?.refreshToken) {
                let expireDate = new Date(fitBitData.tokenCreatedAt);
                expireDate.setHours(expireDate.getHours() + 7);
                if (
                    commonService.compareDates(
                        commonService.indiaTz().toDate(),
                        new Date(expireDate),
                        'greater'
                    )
                ) {
                    console.log("-call---createAccesstoken refreshToken", fitBitData.refreshToken);
                    await createAccesstoken(ctx, fitBitData.refreshToken, userId);

                } else {
                    console.log("-call---accessToken accessToken", fitBitData.accessToken);
                    ctx.request.fitBitAccessToken = { Authorization: `Bearer ${fitBitData.accessToken}`, fitbitUserId: fitBitData.fitbitUserId };
                }
            } else {
                await dbService.update('authenticated_apps', {
                    appName: 'fit-bit',
                    status: 'disconnected'
                }, {
                    where: {
                        userId,
                        appName: 'fit-bit'
                    },
                });
            }
        } catch (error) {
            await dbService.update('authenticated_apps', {
                appName: 'fit-bit',
                status: 'disconnected'
            }, {
                where: {
                    userId,
                    appName: 'fit-bit'
                },
            });
            console.log("----Middleware getFitbitAuthToken Error", error);
            ctx.res.unauthorized({ msg: error?.error?.errors[0]?.message ? error?.error?.errors[0]?.message : error });
            return

        }
        await next();

        async function createAccesstoken(ctx, refreshToken, userId) {
            const basicAuth = Buffer.from(`${config.fitbit.clientId}:${config.fitbit.clientSecret}`).toString('base64');

            await request.post(ctx,
                `${config.fitbit.baseUrl}/oauth2/token?grant_type=refresh_token&refresh_token=${refreshToken}`, {},
                {
                    headers: {
                        'Authorization': `Basic ${basicAuth}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            ).then(async responseData => {
                let newToken = responseData.data
                try {
                    console.info('...newToken...', newToken)
                    const payload = {
                        fitbitUserId: newToken.user_id,
                        refreshToken: newToken.refresh_token,
                        accessToken: newToken.access_token,
                        scope: newToken.scope,
                        tokenCreatedAt: new Date()
                    };
                    ctx.request.fitBitAccessToken = { Authorization: `Bearer ${payload.accessToken}`, fitbitUserId: payload.fitbitUserId };
                    let upsertData = await dbService.update('fit_bit', payload, { where: { userId } });
                    console.info('....upsertData...', upsertData)
                } catch (error) {
                    console.log('\n FITBIT new access and refresh token Update on fitbit Error...', error?.error?.errors);
                    ctx.res.internalServerError({ error: error?.error?.errors ? error?.error?.errors : error });
                    return;
                }

            }).catch(async error => {
                const fitbitData = await dbService.findOne('fit_bit', { where: { userId }, raw: true, attributes: ['userId', 'fitbitUserId', 'id'] });

                if (fitbitData?.fitbitUserId) {
                    let foundAllUser = await dbService.findAll('fit_bit', { where: { fitbitUserId: fitbitData.fitbitUserId }, raw: true, attributes: ['userId', 'fitbitUserId', 'tokenCreatedAt', 'refreshToken', 'id', 'accessToken'] });

                    if (foundAllUser.length > 0) {
                        let userIds = _.map(foundAllUser, (u) => u.userId);
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
                    }
                }

                ctx.res.internalServerError({ msg: error?.error?.errors[0]?.message ? error?.error?.errors[0]?.message : error });
                return;
            })
        }
    },
};