const { Router } = require('../../services/imports');

const router = new Router({ prefix: '/diagnosis-type', });

const middleware = require('../../middleware');
const diagnosis_type = require('../../controllers/diagnosis_type');
const audit = require('../__common');

// diagnosis Type
router.get('/get-durations', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, diagnosis_type.getAllDurations);
router.get('/get-by-clinician', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, diagnosis_type.getListByClinician);
router.get('/get-by-id/:uuid', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, diagnosis_type.getById);
router.get('/get-all-active', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, diagnosis_type.getAllActiveList);
router.post('/get-list', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, diagnosis_type.getList);
router.post('/save', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, diagnosis_type.saveRecord);
router.put('/update', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, diagnosis_type.updateRecord);
router.patch('/approve-request', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, diagnosis_type.approveRequest);
router.delete('/:uuid', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, diagnosis_type.deleteById);

module.exports = router;
