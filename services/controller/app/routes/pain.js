const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/pain',
});

const middleware = require('../middleware');
const config = require('../config/config');
const pain = require('../controllers/pain');

router.get(
  '/get-list',
  middleware.checkAddUrlToHit(config.painUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  pain.get
);
router.get(
  '/get-by-id/:uuid',
  middleware.checkAddUrlToHit(config.painUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  pain.get
);
router.post(
  '/save',
  middleware.checkAddUrlToHit(config.painUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  pain.post
);
router.patch(
  '/toggle-archive',
  middleware.checkAddUrlToHit(config.painUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  pain.patch
);
router.delete(
  '/delete',
  middleware.checkAddUrlToHit(config.painUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  pain.delete
);

router.post(
  '/save-record',
  middleware.checkAddUrlToHit(config.painUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  pain.post
);
router.put(
  '/update-record',
  middleware.checkAddUrlToHit(config.painUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  pain.put
);
router.get(
  '/get-record-list',
  middleware.checkAddUrlToHit(config.painUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  pain.get
);
router.get(
  '/get-chart-data',
  middleware.checkAddUrlToHit(config.painUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  pain.get
);
router.get(
  '/get-record-by-id/:uuid',
  middleware.checkAddUrlToHit(config.painUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  pain.get
);
router.patch(
  '/toggle-archive-record',
  middleware.checkAddUrlToHit(config.painUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  pain.patch
);
router.delete(
  '/delete-record',
  middleware.checkAddUrlToHit(config.painUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  pain.delete
);

module.exports = router;
