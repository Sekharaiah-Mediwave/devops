const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/mood',
});

const middleware = require('../middleware');
const mood = require('../controllers/mood');
const audit = require('./__common');

router.get('/get-by-id/:uuid', middleware.checkRoleToFetchOtherUser(), mood.getById);
router.get('/get-list', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, mood.getList);
router.get('/get-chart-data', middleware.checkRoleToFetchOtherUser(), mood.getChartData);
router.post('/save', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, mood.saveRecord);
router.put('/update', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, mood.updateRecord);
router.delete('/delete', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, mood.deleteRecord);

module.exports = router;
