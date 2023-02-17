const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/sleep',
});

const middleware = require('../middleware');
const sleep = require('../controllers/sleep');
const audit = require('./__common');

router.get('/get-by-id/:uuid', middleware.checkRoleToFetchOtherUser(), sleep.getById);
router.get('/get-list', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, sleep.getList);
router.get('/get-chart-data', middleware.checkRoleToFetchOtherUser(), sleep.getChartData);
router.post('/save', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, sleep.saveRecord);
router.put('/update', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, sleep.updateRecord);
router.patch('/toggle-archive', middleware.checkRoleToFetchOtherUser(), sleep.toggleArchiveRecord);
router.delete('/delete', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, sleep.deleteRecord);

module.exports = router;
