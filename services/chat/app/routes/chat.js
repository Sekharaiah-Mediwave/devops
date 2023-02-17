const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/chat',
});

const config = require('../config/config');
const chat = require('../controllers/chat');
const middleware = require('../middleware');

router.get('/', middleware.checkAddUrlToHit(config.databaseUrl), chat.getRoom);

module.exports = router;
