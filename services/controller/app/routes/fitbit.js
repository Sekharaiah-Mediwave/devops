const { Router } = require('../services/imports');
const router = new Router({
    prefix: '/fitbit'
});

const middleware = require('../middleware');
const config = require('../config/config');
const fitbit = require('../controllers/fitbit');

router.get('/get-parameters', middleware.checkAddUrlToHit(config.fitbitUrl), fitbit.get);
router.post('/access-token', middleware.checkAddUrlToHit(config.fitbitUrl), fitbit.post);
router.get('/sleep-goal', middleware.checkAddUrlToHit(config.fitbitUrl), fitbit.get);
router.get('/get-sleep/by-date-range', middleware.checkAddUrlToHit(config.fitbitUrl), fitbit.get);
router.get('/get-sleep/by-date', middleware.checkAddUrlToHit(config.fitbitUrl), fitbit.get);

router.get('/get-step/by-date', middleware.checkAddUrlToHit(config.fitbitUrl), fitbit.get);
router.get('/get-step/by-date-range', middleware.checkAddUrlToHit(config.fitbitUrl), fitbit.get);
router.post('/disconnected', middleware.checkAddUrlToHit(config.fitbitUrl), fitbit.post);

router.post('/', middleware.checkAddUrlToHit(config.userUrl), fitbit.post);


module.exports = router;