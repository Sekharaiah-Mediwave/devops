const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/notification',
});

const notification = require('../controllers/notification');

router.post('/send-notifications', notification.sendReminders);

module.exports = router;
