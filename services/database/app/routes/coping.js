const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/coping',
});

const middleware = require('../middleware');
const coping = require('../controllers/coping');
const audit = require('./__common');

router.post('/save', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, coping.createCoping);
router.get('/get-list', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, coping.getAllCopingRecord);
router.get('/get-by-uuid/:uuid', middleware.checkRoleToFetchOtherUser(), coping.getCopingRecordByUuid);
router.get('/get-archived-list', middleware.checkRoleToFetchOtherUser(), coping.getAllArchivedCoping);
router.put('/update', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, coping.updateCopingRecord);
router.patch('/toggle-archive', middleware.checkRoleToFetchOtherUser(), coping.toggleArchived);
router.delete('/delete', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, coping.deleteCoping);

module.exports = router;
