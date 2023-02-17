const { Router } = require('../services/imports');
const router = new Router({
    prefix: '/fitbit'
});

const middleware = require('../middleware');
const config = require('../config/config');
const fitbit = require('../controllers/fitbit');

router.get('/get-parameters', middleware.checkAddUrlToHit(config.databaseUrl), fitbit.getFitbit);
router.post('/access-token', middleware.checkAddUrlToHit(config.databaseUrl), fitbit.fitBitOauth2Token);
router.get('/sleep-goal', middleware.checkAddUrlToHit(config.databaseUrl), fitbit.getFitBitSleepGoal);
router.get('/get-sleep/by-date-range', middleware.checkAddUrlToHit(config.databaseUrl), fitbit.getFitBitSleepLogByDateRange);
router.get('/get-sleep/by-date', middleware.checkAddUrlToHit(config.databaseUrl), fitbit.getFitBitSleepLogByDate);


router.get('/get-step/by-date', middleware.checkAddUrlToHit(config.databaseUrl), fitbit.getFitBitStepByDate);
router.get('/get-step/by-date-range', middleware.checkAddUrlToHit(config.databaseUrl), fitbit.getFitBitStepByDateRange);
router.post('/disconnected', middleware.checkAddUrlToHit(config.databaseUrl), fitbit.disconnnected);
module.exports = router;