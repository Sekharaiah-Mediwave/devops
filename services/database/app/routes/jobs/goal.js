const { Router } = require('../../services/imports');

const router = new Router({
  prefix: '/goal',
});

const goal = require('../../controllers/goal');

router.get('/get-reminder-list', goal.getReminderListForJob);
router.get('/ending-at-date', goal.checkRGoalEndingAtDate);
router.post('/sync-fhir', goal.syncFhir);

module.exports = router;
