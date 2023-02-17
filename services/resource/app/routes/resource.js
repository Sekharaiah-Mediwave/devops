const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/resource',
});
const config = require('../config/config');
const resource = require('../controllers/resource');
const middleware = require('../middleware/auth');
const middleware1 = require('../middleware');

router.get('/content', middleware.getAuthToken(), resource.getContent);
router.get('/filter-types', middleware.getAuthToken(), resource.getFilterType);
router.post('/get-resources', middleware.getAuthToken(), resource.getResource);
router.post('/get-favourite-resources', middleware.getAuthToken(), resource.getFavouriteResource);
router.get('/filter-types-count', middleware.getAuthToken(), resource.getFilterTypeCount);
router.get('/get-event-reminder', resource.getResourceReinder);
router.post('/create-event-reminder', resource.createResourceReinder);
router.post(
  '/create-recommended-resource',
  middleware1.checkAddUrlToHit(config.databaseUrl),
  resource.createRecommendedResource
);
router.get(
  '/get-recommended-resource', middleware.getAuthToken(),
  middleware1.checkAddUrlToHit(config.databaseUrl),
  resource.getRecommendedResource
);
router.post(
  '/get-recommended-resource', middleware.getAuthToken(),
  middleware1.checkAddUrlToHit(config.databaseUrl),
  resource.getRecommendedResource
);

module.exports = router;
