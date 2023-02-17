const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/problem',
});

const middleware = require('../middleware');
const config = require('../config/config');
const problem = require('../controllers/problem');

router.get(
  '/get-list',
  middleware.checkAddUrlToHit(config.problemUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  problem.get
);
router.get(
  '/get-by-id/:uuid',
  middleware.checkAddUrlToHit(config.problemUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  problem.get
);
router.post(
  '/save',
  middleware.checkAddUrlToHit(config.problemUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  problem.post
);
router.patch(
  '/toggle-archive',
  middleware.checkAddUrlToHit(config.problemUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  problem.patch
);
router.delete(
  '/delete',
  middleware.checkAddUrlToHit(config.problemUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  problem.delete
);

router.post(
  '/save-record',
  middleware.checkAddUrlToHit(config.problemUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  problem.post
);
router.put(
  '/update-record',
  middleware.checkAddUrlToHit(config.problemUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  problem.put
);
router.get(
  '/get-record-list',
  middleware.checkAddUrlToHit(config.problemUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  problem.get
);
router.get(
  '/get-chart-data',
  middleware.checkAddUrlToHit(config.problemUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  problem.get
);
router.get(
  '/get-record-by-id/:uuid',
  middleware.checkAddUrlToHit(config.problemUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  problem.get
);
router.patch(
  '/toggle-archive-record',
  middleware.checkAddUrlToHit(config.problemUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  problem.patch
);
router.delete(
  '/delete-record',
  middleware.checkAddUrlToHit(config.problemUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  problem.delete
);

module.exports = router;
