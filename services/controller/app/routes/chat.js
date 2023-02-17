const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/chat',
});
const middleware = require('../middleware');
const config = require('../config/config');
const chat = require('../controllers/chat');

router.post(
  '/create-room',
  middleware.checkAddUrlToHit(config.databaseUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  chat.post
);
router.post(
  '/add-message',
  middleware.checkAddUrlToHit(config.databaseUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  chat.post
);
router.post(
  '/add-important-message',
  middleware.checkAddUrlToHit(config.databaseUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  chat.post
);
router.get(
  '/get-important-message',
  middleware.checkAddUrlToHit(config.databaseUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  chat.get
);
router.get(
  '/search-message',
  middleware.checkAddUrlToHit(config.databaseUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  chat.get
);
router.delete(
  '/delete-message',
  middleware.checkAddUrlToHit(config.databaseUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  chat.delete
);
router.delete(
  '/delete-room',
  middleware.checkAddUrlToHit(config.databaseUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  chat.delete
);

module.exports = router;
