const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/resource',
});

const middleware = require('../middleware');
const recommendedResource = require('../controllers/resource');

router.post('/create-recommended-resource', recommendedResource.createRecommendedResource);
router.get('/get-recommended-resource', recommendedResource.getRecommendedResource);

module.exports = router;
