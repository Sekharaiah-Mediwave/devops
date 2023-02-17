const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/smoke-timeline',
});

const middleware = require('../middleware');
const config = require('../config/config');
const smoke = require('../controllers/smoke');

router.get(
  '/get-list',
  middleware.checkAddUrlToHit(config.smokeUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  smoke.get
);
router.get(
  '/get-latest-quitting',
  middleware.checkAddUrlToHit(config.smokeUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  smoke.get
);
router.post(
  '/save',
  middleware.checkAddUrlToHit(config.smokeUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  smoke.post
);
router.patch(
  '/add-no-smoke-entry',
  middleware.checkAddUrlToHit(config.smokeUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  smoke.patch
);
router.patch(
  '/toggle-daily-reminder',
  middleware.checkAddUrlToHit(config.smokeUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  smoke.patch
);
router.patch(
  '/end-quitting',
  middleware.checkAddUrlToHit(config.smokeUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  smoke.patch
);

module.exports = router;
