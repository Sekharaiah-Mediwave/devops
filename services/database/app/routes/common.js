const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/common',
});

const middleware = require('../middleware');
const resourceToken = require('../controllers/common');

router.get('/get-resource-token', resourceToken.getResourceToken);
router.post('/create-resource-token', resourceToken.createResourceToken);
router.get('/get-event-reminder', resourceToken.getResourceReminder);
router.post('/create-event-reminder', resourceToken.createResourceReminder);
router.get('/get-event-reminder-by-user', resourceToken.getResourceReminderByUserId);
router.get('/get-event-reminder-by-date', resourceToken.getResourceReminderByDate);

module.exports = router;
