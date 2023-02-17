const { Router } = require('../services/imports');
const router = new Router({
  prefix: '/fitbit',
});

const middleware = require('../middleware');
const config = require('../config/config');
const fitbit = require('../controllers/fitbit');

router.post('/', middleware.checkAddUrlToHit(config.databaseUrl), fitbit.saveData);

module.exports = router;
