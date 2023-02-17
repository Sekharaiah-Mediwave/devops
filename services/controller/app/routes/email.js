const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/email',
});

const middleware = require('../middleware');
const config = require('../config/config');
const email = require('../controllers/email');

router.post(
  '/login',
  middleware.checkAddUrlToHit(config.emailUrl),
  middleware.checkRoles(['a', 'sa', 'p']),
  email.post
);

module.exports = router;
