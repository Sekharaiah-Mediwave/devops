const { Router } = require('../../services/imports');

const router = new Router({
  prefix: '/location',
});
const middleware = require('../../middleware');
const config = require('../../config/config');
const appointment = require('../../controllers/appointment');

// Clinic Location
router.post(
  '/get-by-location',
  middleware.checkAddUrlToHit(config.appointmentUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  appointment.post
);
router.get(
  '/get-by-id/:uuid',
  middleware.checkAddUrlToHit(config.appointmentUrl),
  middleware.checkRoles(['a']),
  appointment.get
);
router.get(
  '/get-name-by-id/:uuid',
  middleware.checkAddUrlToHit(config.appointmentUrl),
  middleware.checkRoles(['a']),
  appointment.get
);
router.get(
  '/get-name-list',
  middleware.checkAddUrlToHit(config.appointmentUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  appointment.get
);
router.get(
  '/get-locations-list',
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
router.post(
  '/save',
  middleware.checkAddUrlToHit(config.appointmentUrl),
  middleware.checkRoles(['a', 'sa']),
  appointment.post
);
router.put(
  '/update',
  middleware.checkAddUrlToHit(config.appointmentUrl),
  middleware.checkRoles(['a', 'sa']),
  appointment.put
);
router.delete(
  '/delete-location',
  middleware.checkAddUrlToHit(config.appointmentUrl),
  middleware.checkRoles(['a', 'sa']),
  appointment.delete
);
router.delete(
  '/delete-name',
  middleware.checkAddUrlToHit(config.appointmentUrl),
  middleware.checkRoles(['a', 'sa']),
  appointment.delete
);

module.exports = router;
