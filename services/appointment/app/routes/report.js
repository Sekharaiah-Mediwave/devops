const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/report'
});

const config = require('../config/config');
const middleware = require('../middleware');
const report = require('../controllers/report');

//report
router.get('/dashboard-count', middleware.checkAddUrlToHit(config.databaseUrl), report.dashboardCount);

module.exports = router;
