const { Router } = require('../../services/imports');

const router = new Router({ prefix: '/location', });

const middleware = require('../../middleware');
const location = require('../../controllers/clinic_location');
const audit = require('../__common');

// Clinic Location
router.post('/get-by-location', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, location.getByLocation);
router.get('/get-by-id/:uuid', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, location.getById);
router.get('/get-name-by-id/:uuid', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, location.getNameById);
router.post('/get-name-list', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, location.getNameList);
router.post('/get-locations-list', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, location.getLocationsList);
router.post('/get-list', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, location.getList);
router.post('/save', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, location.saveRecord);
router.put('/update', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, location.updateRecord);
router.delete('/delete-location', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, location.deleteLocationById);
router.delete('/delete-name', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, location.deleteNameById);

module.exports = router;
