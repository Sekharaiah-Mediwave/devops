const { Router } = require('../services/imports');
const router = new Router({
    prefix: '/fitbit'
});

const middleware = require('../middleware');
const { getFitbitAuthToken } = require('../middleware/fitbitAuth');

const fitbit = require('../controllers/fitbit');

router.get('/get-parameters', middleware.checkRoleToFetchOtherUser(), fitbit.getFitBitParameters);
router.post('/access-token', middleware.checkRoleToFetchOtherUser(), fitbit.fitBitOauth2Token);
router.get('/sleep-goal', middleware.checkRoleToFetchOtherUser(), getFitbitAuthToken(), fitbit.getFitBitSleepGoal);
router.get('/get-sleep/by-date-range', middleware.checkRoleToFetchOtherUser(), getFitbitAuthToken(), fitbit.getFitBitSleepLogByDateRange);
router.get('/get-sleep/by-date', middleware.checkRoleToFetchOtherUser(), getFitbitAuthToken(), fitbit.getFitBitSleepLogByDate);

router.get('/get-step/by-date', middleware.checkRoleToFetchOtherUser(), getFitbitAuthToken(), fitbit.getFitBitStepByDate);
router.get('/get-step/by-date-range', middleware.checkRoleToFetchOtherUser(), getFitbitAuthToken(), fitbit.getFitBitStepByDateRange);
router.post('/disconnected', middleware.checkRoleToFetchOtherUser(), getFitbitAuthToken(), fitbit.disconnected);

router.post('/', middleware.checkRoleToFetchOtherUser(), fitbit.savedFitbit);

module.exports = router;

// activity tracker
// last- till date