const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/temperature',
});

const middleware = require('../middleware');
const temperature = require('../controllers/temperature');
const audit = require('./__common');

router.post('/save', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, temperature.createTemperature);
router.get('/get', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, temperature.getAllTemperature);
router.get('/get-by-uuid/:uuid', middleware.checkRoleToFetchOtherUser(), temperature.getByUuid);
router.get('/get-chart-data', middleware.checkRoleToFetchOtherUser(), temperature.getChartData);
router.put('/update', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, temperature.updateRecord);
router.delete('/delete', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, temperature.deleteRecord);

module.exports = router;
