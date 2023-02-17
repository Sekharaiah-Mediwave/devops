const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/mood',
});
const middleware = require('../middleware');
const config = require('../config/config');
const mood = require('../controllers/mood');

router.get(
  '/get-by-id/:uuid',
  middleware.checkAddUrlToHit(config.moodUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  mood.get
);
router.get(
  '/get-list',
  middleware.checkAddUrlToHit(config.moodUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  mood.get
);
router.get(
  '/get-chart-data',
  middleware.checkAddUrlToHit(config.moodUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  mood.get
);
router.post(
  '/save',
  middleware.checkAddUrlToHit(config.moodUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  mood.post
);
router.put(
  '/update',
  middleware.checkAddUrlToHit(config.moodUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  mood.put
);
router.delete(
  '/delete',
  middleware.checkAddUrlToHit(config.moodUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  mood.delete
);

module.exports = router;
