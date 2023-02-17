const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/alcohol',
});

const middleware = require('../middleware');
const config = require('../config/config');
const alcohol = require('../controllers/alcohol');

router.get(
  '/get-by-id/:uuid',
  middleware.checkAddUrlToHit(config.alcoholUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  alcohol.get
);
router.get(
  '/get-list',
  middleware.checkAddUrlToHit(config.alcoholUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  alcohol.get
);
router.get(
  '/get-chart-data',
  middleware.checkAddUrlToHit(config.alcoholUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  alcohol.get
);
router.post(
  '/save',
  middleware.checkAddUrlToHit(config.alcoholUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  alcohol.post
);
router.put(
  '/update',
  middleware.checkAddUrlToHit(config.alcoholUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  alcohol.put
);
router.patch(
  '/toggle-archive',
  middleware.checkAddUrlToHit(config.alcoholUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  alcohol.patch
);
router.delete(
  '/delete',
  middleware.checkAddUrlToHit(config.alcoholUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  alcohol.delete
);

module.exports = router;
