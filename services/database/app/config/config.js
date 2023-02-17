/* eslint-disable no-undef */
const { dotenv } = require('../services/imports');

dotenv.config({ path: __dirname + '/../../.env' });

const envConfigs = {
    port: process.env.PORT,
    host: process.env.HOST,
    jwtSecret: process.env.JWTSECRET,
    tpJwtSecret: process.env.TPJWTSECRET,
    cryptoKey: process.env.CRYPTO_KEY || '@$$re89tKey',
    clientId: process.env.TPCLIENTID,
    tpId: process.env.TPID,
    accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY,
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY,
    resetPasswordTokenExpiry: process.env.RESET_PASSWORD_TOKEN_EXPIRY,
    roleNames: {
        ma: 'MAdmin',
        a: 'Admin',
        cl: 'Clinician',
        ct: 'Care Team',
        t: 'Teacher',
        sa: 'Super Admin',
        p: 'Patient',
    },
    postgres: {
        db: process.env.PG_DB,
        user: process.env.PG_USER,
        password: process.env.PG_PASSWORD,
        host: process.env.PG_HOST,
        port: process.env.PG_PORT,
    },
    dbLog: (process.env.PG_DB_LOGGING === '1'),
    development: {
        username: process.env.PG_USER,
        password: process.env.PG_PASSWORD,
        database: process.env.PG_DB,
        host: process.env.PG_HOST,
        dialect: 'postgres'
    },
    test: {
        username: process.env.PG_USER,
        password: process.env.PG_PASSWORD,
        database: process.env.PG_DB,
        host: process.env.PG_HOST,
        dialect: 'postgres'
    },
    production: {
        username: process.env.PG_USER,
        password: process.env.PG_PASSWORD,
        database: process.env.PG_DB,
        host: process.env.PG_HOST,
        dialect: 'postgres'
    },
    emailUrl: checkEndStringAndRemove(process.env.EMAIL_URL, '/'),
    redisUrl: checkEndStringAndRemove(process.env.REDIS_URL, '/'),
    circleUrl: checkEndStringAndRemove(process.env.CIRCLE_URL, '/'),
    notificationUrl: checkEndStringAndRemove(process.env.NOTIFICATION_URL, '/'),
    has_audit_trail: process.env.HAS_AUDIT_TRAIL || true,
    fitbit: {
        clientId: process.env.FITBIT_CLIENT_ID,
        scope: process.env.SCOPE,
        responseType: process.env.RESPONSE_TYPE,
        clientSecret: process.env.CLIENT_SECRET,
        redirectUrl: process.env.REDIRECT_URL,
        refreshTokenUrl: process.env.REFRESH_TOKEN_URL,
        baseUrl: process.env.FITBIT_BASE_URL
    },
    amqp_url: checkEndStringAndRemove(process.env.AMQP_URL, '/'),
    queueChannel: {
        notification: 'notify-queue',
        appointment: 'appointment-queue',
    },
};

function checkEndStringAndRemove(stringToCheck = '', endStringToValidate = '') {
    if (stringToCheck.endsWith(endStringToValidate)) {
        return stringToCheck.slice(0, (stringToCheck.length - endStringToValidate.length));
    }
    return stringToCheck;
}

let resetPasswordTokenExpiry = (envConfigs.resetPasswordTokenExpiry || '').split(' ');

if (resetPasswordTokenExpiry.length == 2) {
    const validTimeUnits = [
        'years',
        'y',
        'months',
        'M',
        'weeks',
        'w',
        'days',
        'd',
        'hours',
        'h',
        'minutes',
        'm',
        'seconds',
        's',
        'milliseconds',
        'ms',
    ];
    resetPasswordTokenExpiry = [
        Number(resetPasswordTokenExpiry[0]),
        validTimeUnits.includes(resetPasswordTokenExpiry[1]) ? resetPasswordTokenExpiry[1] : 'm',
    ];
} else {
    resetPasswordTokenExpiry = [24, 'h'];
}

module.exports = { ...envConfigs, resetPasswordTokenExpiry };
