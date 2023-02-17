const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/bmi',
});
const middleware = require('../middleware');
const config = require('../config/config');
const bmi = require('../controllers/bmi');

router.get(
  '/get-by-uuid/:uuid',
  middleware.checkAddUrlToHit(config.bmiUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  bmi.get
);
router.get(
  '/get-list',
  middleware.checkAddUrlToHit(config.bmiUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  bmi.get
);
router.get(
  '/get-chart-data',
  middleware.checkAddUrlToHit(config.bmiUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  bmi.get
);
router.get(
  '/get-last-entry',
  middleware.checkAddUrlToHit(config.bmiUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  bmi.get
);
router.post(
  '/save',
  middleware.checkAddUrlToHit(config.bmiUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  bmi.post
);
router.put(
  '/update',
  middleware.checkAddUrlToHit(config.bmiUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  bmi.put
);
router.delete(
  '/delete',
  middleware.checkAddUrlToHit(config.bmiUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  bmi.delete
);

module.exports = router;
