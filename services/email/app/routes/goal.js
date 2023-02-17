const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/goal',
});

const goal = require('../controllers/goal');

router.post('/send-rgoal-no-tasks-for-today', goal.sendRGoalNoTasksForToday);
router.post('/send-rgoal-reminders', goal.sendRGoalReminders);
router.post('/send-rgoal-completed-bulk', goal.sendRGoalBulkCompleted);

module.exports = router;
