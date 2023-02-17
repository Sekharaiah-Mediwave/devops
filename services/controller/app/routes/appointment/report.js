const { Router } = require('../../services/imports');

const router = new Router({
  prefix: '/report',
});
const middleware = require('../../middleware');
const config = require('../../config/config');
const appointment = require('../../controllers/appointment');

// report
router.get(
  '/report/dashboard-count',
  middleware.checkAddUrlToHit(config.appointmentUrl),
  middleware.checkRoles(['a', 'sa', 'cl']),
  appointment.get
);

module.exports = router;
