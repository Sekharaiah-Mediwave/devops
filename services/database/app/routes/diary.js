const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/diary',
});

const middleware = require('../middleware');
const diary = require('../controllers/diary');
const audit = require('./__common');

router.get('/get-by-id/:uuid', middleware.checkRoleToFetchOtherUser(), diary.getById);
router.get('/get-list', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, diary.getList);
router.get('/get-date-list', middleware.checkRoleToFetchOtherUser(), diary.getDateList);
router.post('/save', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, diary.saveRecord);
router.put('/update', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, diary.updateRecord);
router.delete('/delete', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, diary.deleteRecord);

module.exports = router;
