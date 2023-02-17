const { Router } = require('../../services/imports');

const router = new Router({
  prefix: '/clinic',
});
const middleware = require('../../middleware');
const config = require('../../config/config');
const appointment = require('../../controllers/appointment');

// Clinic
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
  '/get-list-dashboard-count',
  middleware.checkAddUrlToHit(config.appointmentUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
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
  middleware.checkRoles(['a', 'sa', 'cl']),
  appointment.put
);
router.delete(
  '/:uuid',
  middleware.checkAddUrlToHit(config.appointmentUrl),
  middleware.checkRoles(['a', 'sa', 'cl']),
  appointment.delete
);

router.get('/get-times-by-clinic', middleware.checkAddUrlToHit(config.appointmentUrl), middleware.checkRoles(['a', 'sa', 'cl', 'p']), appointment.get);
router.get('/get-time-by-id', middleware.checkAddUrlToHit(config.appointmentUrl), middleware.checkRoles(['a', 'sa', 'cl', 'p']), appointment.get);
router.get('/get-slots-by-clinic', middleware.checkAddUrlToHit(config.appointmentUrl), middleware.checkRoles(['a', 'sa', 'cl', 'p']), appointment.get);
router.get('/get-slots-by-clinic-time', middleware.checkAddUrlToHit(config.appointmentUrl), middleware.checkRoles(['a', 'sa', 'cl', 'p']), appointment.get);
router.get('/get-slot-by-id', middleware.checkAddUrlToHit(config.appointmentUrl), middleware.checkRoles(['a', 'sa', 'cl', 'p']), appointment.get);

module.exports = router;
