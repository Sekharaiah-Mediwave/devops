const { Router } = require('../../services/imports');

const router = new Router({ prefix: '/report', });

const middleware = require('../../middleware');
const report = require('../../controllers/report');
const audit = require('../__common');

// report
router.get('/dashboard-count', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, report.dashboardCount);

module.exports = router;
