const { Router } = require('../../services/imports');

const router = new Router({
  prefix: '/diagnosis-type',
});
const middleware = require('../../middleware');
const config = require('../../config/config');
const appointment = require('../../controllers/appointment');

// Diagnosis Type
router.get(
  '/get-by-clinician',
  middleware.checkAddUrlToHit(config.appointmentUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  appointment.get
);
router.get(
  '/get-all-active',
  middleware.checkAddUrlToHit(config.appointmentUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  appointment.get
);
router.get(
  '/get-durations',
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
  appointment.get
);
router.post(
  '/save',
  middleware.checkAddUrlToHit(config.appointmentUrl),
  middleware.checkRoles(['a', 'sa', 'cl']),
  appointment.post
);
router.put(
  '/update',
  middleware.checkAddUrlToHit(config.appointmentUrl),
  middleware.checkRoles(['a', 'sa']),
  appointment.put
);
router.patch(
  '/approve-request',
  middleware.checkAddUrlToHit(config.appointmentUrl),
  middleware.checkRoles(['a', 'sa']),
  appointment.patch
);
router.delete(
  '/:uuid',
  middleware.checkAddUrlToHit(config.appointmentUrl),
  middleware.checkRoles(['a', 'sa']),
  appointment.delete
);

module.exports = router;
