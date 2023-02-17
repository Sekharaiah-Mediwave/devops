const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/sleep',
});

const middleware = require('../middleware');
const config = require('../config/config');
const sleep = require('../controllers/sleep');

router.get(
  '/get-by-id/:uuid',
  middleware.checkAddUrlToHit(config.sleepUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  sleep.get
);
router.get(
  '/get-list',
  middleware.checkAddUrlToHit(config.sleepUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  sleep.get
);
router.get(
  '/get-chart-data',
  middleware.checkAddUrlToHit(config.sleepUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  sleep.get
);
router.post(
  '/save',
  middleware.checkAddUrlToHit(config.sleepUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  sleep.post
);
router.put(
  '/update',
  middleware.checkAddUrlToHit(config.sleepUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  sleep.put
);
router.patch(
  '/toggle-archive',
  middleware.checkAddUrlToHit(config.sleepUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  sleep.patch
);
router.delete(
  '/delete',
  middleware.checkAddUrlToHit(config.sleepUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  sleep.delete
);

module.exports = router;
