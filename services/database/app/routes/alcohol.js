const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/alcohol',
});

const middleware = require('../middleware');
const alcohol = require('../controllers/alcohol');
const audit = require('./__common');

router.get('/get-by-id/:uuid', middleware.checkRoleToFetchOtherUser(), alcohol.getById);
router.get('/get-list', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, alcohol.getList);
router.get('/get-chart-data', middleware.checkRoleToFetchOtherUser(), alcohol.getChartData);
router.post('/save', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, alcohol.saveRecord);
router.put('/update', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, alcohol.updateRecord);
router.patch('/toggle-archive', middleware.checkRoleToFetchOtherUser(), alcohol.toggleArchiveRecord);
router.delete('/delete', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, alcohol.deleteRecord);

module.exports = router;
