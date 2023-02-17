const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/smoke-timeline',
});

const middleware = require('../middleware');
const smokeTimeline = require('../controllers/smoke_timeline');
const audit = require('./__common');

router.get('/get-list', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, smokeTimeline.getList);
router.get('/get-latest-quitting', middleware.checkRoleToFetchOtherUser(), smokeTimeline.getLatestQuitting);
router.get('/get-daily-reminder-users', middleware.checkRoleToFetchOtherUser(), smokeTimeline.dailyReminderUsers);
router.post('/save', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, smokeTimeline.saveRecord);
router.patch('/add-no-smoke-entry', middleware.checkRoleToFetchOtherUser(), smokeTimeline.addNoSmokeEntry);
router.patch('/toggle-daily-reminder', middleware.checkRoleToFetchOtherUser(), smokeTimeline.toggleDailyReminder);
router.patch('/end-quitting', middleware.checkRoleToFetchOtherUser(), smokeTimeline.endQuitting);

module.exports = router;
