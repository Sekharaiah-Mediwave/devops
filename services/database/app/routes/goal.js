const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/goal',
});

const middleware = require('../middleware');
const goal = require('../controllers/goal');
const audit = require('./__common');

router.post('/', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, goal.createRGoal);
router.get('/steps-by-date', middleware.checkRoleToFetchOtherUser(), goal.getRGoalsByDate);
router.put('/complete-step/:entry_id', middleware.checkRoleToFetchOtherUser(), goal.markStepCompleted);
router.put('/status/:goal_id', middleware.checkRoleToFetchOtherUser(), goal.archiveOrActivateGoal);
router.get('/get-reminder-list', goal.getReminderListForJob);
router.put('/update-rgoal-reminders', middleware.checkRoleToFetchOtherUser(), goal.updateRGoalReminders);
router.put('/update/:goal_id', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, goal.updateRGoal);
router.get('/tasks-left-for-date', middleware.checkRoleToFetchOtherUser(), goal.checkRGoalTasksLeftForDate);
router.get('/ending-at-date', middleware.checkRoleToFetchOtherUser(), goal.checkRGoalEndingAtDate);
router.get('/', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, goal.getAllRGoals);

module.exports = router;
