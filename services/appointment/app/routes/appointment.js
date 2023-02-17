const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/appointment'
});

const config = require('../config/config');
const appointment = require('../controllers/appointment');
const middleware = require('../middleware');

// Appointment
router.get('/check-slot-booked', middleware.checkAddUrlToHit(config.databaseUrl), appointment.checkSlotBooked);
router.get('/get-by-id/:uuid', middleware.checkAddUrlToHit(config.databaseUrl), appointment.getById);
router.get('/get-list', middleware.checkAddUrlToHit(config.databaseUrl), appointment.getList);
router.get('/get-all', middleware.checkAddUrlToHit(config.databaseUrl), appointment.getAllList);
router.post('/save', middleware.checkAddUrlToHit(config.databaseUrl), appointment.saveRecord);
router.post('/amend-booking', middleware.checkAddUrlToHit(config.databaseUrl), appointment.amendBooking);
router.put('/update', middleware.checkAddUrlToHit(config.databaseUrl), appointment.updateAppointment);
router.put('/cancel', middleware.checkAddUrlToHit(config.databaseUrl), appointment.cancelAppointment);

module.exports = router;
