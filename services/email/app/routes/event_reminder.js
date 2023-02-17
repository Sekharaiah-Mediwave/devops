const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/event-reminder',
});

const event_reminder = require('../controllers/event_reminder');

router.post('/send-event-reminders', event_reminder.sendReminders);

module.exports = router;
