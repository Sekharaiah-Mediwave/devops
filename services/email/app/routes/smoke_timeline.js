const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/smoke-timeline',
});

const smokeTimeline = require('../controllers/smoke_timeline');

router.post('/send-reminder', smokeTimeline.sendReminderMail);

module.exports = router;
