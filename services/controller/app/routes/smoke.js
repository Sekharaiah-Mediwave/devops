const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/smoke',
});

const middleware = require('../middleware');
const config = require('../config/config');
const smoke = require('../controllers/smoke');

router.get(
  '/get-by-id/:uuid',
  middleware.checkAddUrlToHit(config.smokeUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  smoke.get
);
router.get(
  '/get-list',
  middleware.checkAddUrlToHit(config.smokeUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  smoke.get
);
router.get(
  '/get-chart-data',
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
router.put(
  '/update',
  middleware.checkAddUrlToHit(config.smokeUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  smoke.put
);
router.patch(
  '/toggle-archive',
  middleware.checkAddUrlToHit(config.smokeUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  smoke.patch
);
router.delete(
  '/delete',
  middleware.checkAddUrlToHit(config.smokeUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  smoke.delete
);

module.exports = router;
