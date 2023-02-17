const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/circle',
});
const middleware = require('../middleware');
const config = require('../config/config');
const circle = require('../controllers/circle');

router.get(
  '/get-connected-users-by-id',
  middleware.checkAddUrlToHit(config.circleUrl),
  middleware.checkRoles(['a', 'sa', 'cl', 'p']),
  circle.get
);
router.get(
  '/get-by-id',
  middleware.checkAddUrlToHit(config.circleUrl),
  middleware.checkRoles(['a', 'sa', 'cl', 'p']),
  circle.get
);
router.get(
  '/get-community-users',
  middleware.checkAddUrlToHit(config.circleUrl),
  middleware.checkRoles(['a', 'sa', 'cl', 'p']),
  circle.get
);
router.get(
  '/get-all-circle',
  middleware.checkAddUrlToHit(config.circleUrl),
  middleware.checkRoles(['a', 'sa', 'cl', 'p']),
  circle.get
);
router.get(
  '/get-all-circle-user',
  middleware.checkAddUrlToHit(config.circleUrl),
  middleware.checkRoles(['a', 'sa', 'cl', 'p']),
  circle.get
);
router.post(
  '/invite',
  middleware.checkAddUrlToHit(config.circleUrl),
  middleware.checkRoles(['a', 'sa', 'cl', 'p']),
  circle.post
);
router.post(
  '/accept-circle-invite',
  middleware.checkAddUrlToHit(config.circleUrl),
  middleware.checkRoles(['a', 'sa', 'cl', 'p']),
  circle.post
);
router.post(
  '/reject-circle-invite',
  middleware.checkAddUrlToHit(config.circleUrl),
  middleware.checkRoles(['a', 'sa', 'cl', 'p']),
  circle.post
);
router.post(
  '/cancel-circle-invite',
  middleware.checkAddUrlToHit(config.circleUrl),
  middleware.checkRoles(['a', 'sa', 'cl', 'p']),
  circle.post
);
router.get(
  '/request-recieved',
  middleware.checkAddUrlToHit(config.circleUrl),
  middleware.checkRoles(['a', 'sa', 'cl', 'p']),
  circle.get
);
router.get(
  '/request-sent',
  middleware.checkAddUrlToHit(config.circleUrl),
  middleware.checkRoles(['a', 'sa', 'cl', 'p']),
  circle.get
);
router.patch(
  '/update-modules',
  middleware.checkAddUrlToHit(config.circleUrl),
  middleware.checkRoles(['a', 'sa', 'cl', 'p']),
  circle.patch
);
router.patch(
  '/remove-circle',
  middleware.checkAddUrlToHit(config.circleUrl),
  middleware.checkRoles(['a', 'sa', 'cl', 'p']),
  circle.patch
);

module.exports = router;
