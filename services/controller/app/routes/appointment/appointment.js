const { Router } = require('../../services/imports');

const router = new Router({
  prefix: '/appointment',
});
const middleware = require('../../middleware');
const config = require('../../config/config');
const appointment = require('../../controllers/appointment');

// Appointment
router.get(
  '/check-slot-booked',
  middleware.checkAddUrlToHit(config.appointmentUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  appointment.get
);
router.get(
  '/get-by-id/:uuid',
  middleware.checkAddUrlToHit(config.appointmentUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  appointment.get
);
router.get(
  '/get-list',
  middleware.checkAddUrlToHit(config.appointmentUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  appointment.get
);
router.get(
  '/get-all',
  middleware.checkAddUrlToHit(config.appointmentUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  appointment.get
);
router.post(
  '/save',
  middleware.checkAddUrlToHit(config.appointmentUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  appointment.post
);
router.post(
  '/amend-booking',
  middleware.checkAddUrlToHit(config.appointmentUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  appointment.post
);
router.put(
  '/update',
  middleware.checkAddUrlToHit(config.appointmentUrl),
  middleware.checkRoles(['a', 'sa', 'cl']),
  appointment.put
);
router.put(
  '/cancel',
  middleware.checkAddUrlToHit(config.appointmentUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  appointment.put
);

module.exports = router;
