const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/resource',
});
const middleware = require('../middleware');
const config = require('../config/config');
const resource = require('../controllers/resource');

router.get(
  '/content',
  middleware.checkAddUrlToHit(config.resourceUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  resource.get
);
router.get(
  '/filter-types',
  middleware.checkAddUrlToHit(config.resourceUrl),
  resource.get
);
router.post(
  '/get-resources',
  middleware.checkAddUrlToHit(config.resourceUrl),
  resource.post
);
router.post(
  '/get-favourite-resources',
  middleware.checkAddUrlToHit(config.resourceUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  resource.post
);
router.get(
  '/filter-types-count',
  middleware.checkAddUrlToHit(config.resourceUrl),
  resource.get
);

router.get(
  '/get-event-reminder',
  middleware.checkAddUrlToHit(config.resourceUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  resource.get
);
router.post(
  '/create-event-reminder',
  middleware.checkAddUrlToHit(config.resourceUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  resource.post
);
router.get(
  '/get-recommended-resource',
  middleware.checkAddUrlToHit(config.resourceUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  resource.get
);
router.post(
  '/get-recommended-resource',
  middleware.checkAddUrlToHit(config.resourceUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  resource.post
);
router.post(
  '/create-recommended-resource',
  middleware.checkAddUrlToHit(config.resourceUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  resource.post
);

module.exports = router;
