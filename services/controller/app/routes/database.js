const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/',
});

const middleware = require('../middleware');
const config = require('../config/config');
const database = require('../controllers/database');

router.post(
  '/login',
  middleware.checkAddUrlToHit(config.databaseUrl),
  middleware.checkRoles(['a', 'sa', 'p']),
  database.post
);

module.exports = router;
