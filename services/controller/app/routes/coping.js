const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/coping',
});

const middleware = require('../middleware');
const config = require('../config/config');
const coping = require('../controllers/coping');

router.post(
  '/save',
  middleware.checkAddUrlToHit(config.copingUrl),
  middleware.checkRoles(['a', 'sa', 'cl', 'p']),
  coping.post
);
router.get(
  '/get-list',
  middleware.checkAddUrlToHit(config.copingUrl),
  middleware.checkRoles(['a', 'sa', 'cl', 'p']),
  coping.get
);
router.get(
  '/get-by-uuid/:uuid',
  middleware.checkAddUrlToHit(config.copingUrl),
  middleware.checkRoles(['a', 'sa', 'cl', 'p']),
  coping.get
);
router.get(
  '/get-archived-list',
  middleware.checkAddUrlToHit(config.copingUrl),
  middleware.checkRoles(['a', 'sa', 'cl', 'p']),
  coping.get
);
router.put(
  '/update',
  middleware.checkAddUrlToHit(config.copingUrl),
  middleware.checkRoles(['a', 'sa', 'cl', 'p']),
  coping.put
);
router.patch(
  '/toggle-archive',
  middleware.checkAddUrlToHit(config.copingUrl),
  middleware.checkRoles(['a', 'sa', 'cl', 'p']),
  coping.patch
);
router.delete(
  '/delete',
  middleware.checkAddUrlToHit(config.copingUrl),
  middleware.checkRoles(['a', 'sa', 'cl', 'p']),
  coping.delete
);

module.exports = router;
