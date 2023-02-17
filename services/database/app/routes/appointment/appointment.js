const { Router } = require('../../services/imports');

const router = new Router({ prefix: '/appointment', });

const middleware = require('../../middleware');
const appointment = require('../../controllers/appointment');
const audit = require('../__common');

// Appointment
router.get('/check-slot-booked', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, appointment.checkSlotBooked);
router.get('/get-by-id/:uuid', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, appointment.getById);
router.post('/get-list', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, appointment.getList);
router.post('/get-all', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, appointment.getAllList);
router.post('/save', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, appointment.saveRecord);
router.post('/amend-booking', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, appointment.amendBooking);
router.put('/update', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, appointment.updateAppointment);
router.put('/cancel', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, appointment.cancelAppointment);
router.put('/update-missed', middleware.checkRoleToFetchOtherUser(), appointment.updateMissedAppointment);

module.exports = router;
