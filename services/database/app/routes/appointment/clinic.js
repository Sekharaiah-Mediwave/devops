const { Router } = require('../../services/imports');

const router = new Router({ prefix: '/clinic', });

const middleware = require('../../middleware');
const clinic = require('../../controllers/clinic');
const audit = require('../__common');

// Clinic
router.get('/get-by-id/:uuid', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, clinic.getById);
router.get('/get-times-by-clinic', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, clinic.getTimesByClinic);
router.get('/get-time-by-id', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, clinic.getTimeById);
router.get('/get-slots-by-clinic', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, clinic.getSlotsByClinic);
router.get('/get-slots-by-clinic-time', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, clinic.getSlotsByClinicTime);
router.get('/get-slot-by-id', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, clinic.getSlotById);
router.post('/get-list', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, clinic.getList);
router.post('/get-list-dashboard-count', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, clinic.getListDashboardCount);
router.post('/save', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, clinic.saveRecord);
router.put('/update', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, clinic.updateRecord);
router.delete('/:uuid', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, clinic.deleteById);

module.exports = router;
