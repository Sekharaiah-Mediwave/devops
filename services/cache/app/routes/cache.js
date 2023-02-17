const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/cache',
});

const cache = require('../controllers/cache');

router.post('/get', cache.getCache);
router.post('/set', cache.setCache);

module.exports = router;
