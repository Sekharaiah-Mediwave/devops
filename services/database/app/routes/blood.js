const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/blood-pressure',
});

const middleware = require('../middleware');
const blood = require('../controllers/blood');
const audit = require('./__common');

router.get('/get-by-uuid/:uuid', middleware.checkRoleToFetchOtherUser(), blood.getByUuid);
router.get('/get-list', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, blood.getList);
router.get('/get-chart-data', middleware.checkRoleToFetchOtherUser(), blood.getChartData);
router.post('/save', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, blood.saveRecord);
router.put('/update', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, blood.updateRecord);
router.delete('/delete', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, blood.deleteRecord);

module.exports = router;
