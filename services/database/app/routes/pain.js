const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/pain',
});

const middleware = require('../middleware');
const pain = require('../controllers/pain');
const audit = require('./__common');

router.get('/get-list', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, pain.getPainList);
router.get('/get-by-id/:uuid', middleware.checkRoleToFetchOtherUser(), pain.getPainById);
router.post('/save', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, pain.createPain);
router.patch('/toggle-archive', middleware.checkRoleToFetchOtherUser(), pain.toggleArchivePain);
router.delete('/delete', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, pain.deletePain);

router.post('/save-record', middleware.checkRoleToFetchOtherUser(), pain.savePainRecord);
router.put('/update-record', middleware.checkRoleToFetchOtherUser(), pain.updatePainRecord);
router.get('/get-record-list', middleware.checkRoleToFetchOtherUser(), pain.getPainRecordList);
router.get('/get-chart-data', middleware.checkRoleToFetchOtherUser(), pain.getPainRecordChartData);
router.get('/get-record-by-id/:uuid', middleware.checkRoleToFetchOtherUser(), pain.getPainRecordById);
router.patch('/toggle-archive-record', middleware.checkRoleToFetchOtherUser(), pain.toggleArchivePainRecord);
router.delete('/delete-record', middleware.checkRoleToFetchOtherUser(), pain.deletePainRecord);

module.exports = router;
