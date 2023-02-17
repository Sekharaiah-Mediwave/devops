const { Router } = require('../../services/imports');

const router = new Router({ prefix: '/vaccine', });

const middleware = require('../../middleware');
const vaccination_type = require('../../controllers/vaccination_type');
const audit = require('../__common');
// Vaccination Type
router.get('/get-by-clinician', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, vaccination_type.getListByClinician);
router.get('/get-by-id/:uuid', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, vaccination_type.getById);
router.get('/get-list', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, vaccination_type.getList);
router.post('/save', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, vaccination_type.saveRecord);
router.put('/update/assign-questionnaire', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, vaccination_type.assignQuestionnaire);
router.put('/update', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, vaccination_type.updateRecord);
router.delete('/:uuid', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, vaccination_type.deleteById);

module.exports = router;
