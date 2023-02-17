const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/smoke',
});

const middleware = require('../middleware');
const smoke = require('../controllers/smoke');
const audit = require('./__common');

router.get('/get-by-id/:uuid', middleware.checkRoleToFetchOtherUser(), smoke.getById);
router.get('/get-list', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, smoke.getList);
router.get('/get-chart-data', middleware.checkRoleToFetchOtherUser(), smoke.getChartData);
router.post('/save', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, smoke.saveRecord);
router.put('/update', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, smoke.updateRecord);
router.patch('/toggle-archive', middleware.checkRoleToFetchOtherUser(), smoke.toggleArchiveRecord);
router.delete('/delete', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, smoke.deleteRecord);

module.exports = router;
