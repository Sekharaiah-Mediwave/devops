const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/blood-pressure',
});
const middleware = require('../middleware');
const config = require('../config/config');
const blood = require('../controllers/blood');

router.get(
  '/get-by-uuid/:uuid',
  middleware.checkAddUrlToHit(config.bloodUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  blood.get
);
router.get(
  '/get-list',
  middleware.checkAddUrlToHit(config.bloodUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  blood.get
);
router.get(
  '/get-chart-data',
  middleware.checkAddUrlToHit(config.bloodUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  blood.get
);
router.post(
  '/save',
  middleware.checkAddUrlToHit(config.bloodUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  blood.post
);
router.put(
  '/update',
  middleware.checkAddUrlToHit(config.bloodUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  blood.put
);
router.delete(
  '/delete',
  middleware.checkAddUrlToHit(config.bloodUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  blood.delete
);

module.exports = router;
