const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/bmi',
});

const middleware = require('../middleware');
const bmi = require('../controllers/bmi');
const audit = require('./__common');

router.get('/get-by-uuid/:uuid', middleware.checkRoleToFetchOtherUser(), bmi.getByUuid);
router.get('/get-list', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, bmi.getList);
router.get('/get-chart-data', middleware.checkRoleToFetchOtherUser(), bmi.getChartData);
router.get('/get-last-entry', middleware.checkRoleToFetchOtherUser(), bmi.getLastEntry);
router.post('/save', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, bmi.saveRecord);
router.put('/update', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, bmi.updateRecord);
router.delete('/delete', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, bmi.deleteRecord);

module.exports = router;
