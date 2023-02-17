const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/temperature',
});

const middleware = require('../middleware');
const config = require('../config/config');
const temperature = require('../controllers/temperature');

router.post(
  '/save',
  middleware.checkAddUrlToHit(config.temperatureUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  temperature.post
);
router.get(
  '/get',
  middleware.checkAddUrlToHit(config.temperatureUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  temperature.get
);
router.get(
  '/get-chart-data',
  middleware.checkAddUrlToHit(config.temperatureUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  temperature.get
);
router.get(
  '/get-by-uuid/:uuid',
  middleware.checkAddUrlToHit(config.temperatureUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  temperature.get
);
router.put(
  '/update',
  middleware.checkAddUrlToHit(config.temperatureUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  temperature.put
);
router.delete(
  '/delete',
  middleware.checkAddUrlToHit(config.temperatureUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  temperature.delete
);

module.exports = router;
