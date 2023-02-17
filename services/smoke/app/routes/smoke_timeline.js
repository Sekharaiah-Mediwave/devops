const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/smoke-timeline',
});

const config = require('../config/config');
const smokeTimeline = require('../controllers/smoke_timeline');
const middleware = require('../middleware');

router.get('/get-list', middleware.checkAddUrlToHit(config.databaseUrl), smokeTimeline.getList);
router.get('/get-latest-quitting', middleware.checkAddUrlToHit(config.databaseUrl), smokeTimeline.getLatestQuitting);
router.post('/save', middleware.checkAddUrlToHit(config.databaseUrl), smokeTimeline.saveRecord);
router.patch('/add-no-smoke-entry', middleware.checkAddUrlToHit(config.databaseUrl), smokeTimeline.addNoSmokeEntry);
router.patch(
  '/toggle-daily-reminder',
  middleware.checkAddUrlToHit(config.databaseUrl),
  smokeTimeline.toggleDailyReminder
);
router.patch('/end-quitting', middleware.checkAddUrlToHit(config.databaseUrl), smokeTimeline.endQuitting);

router.post('/fhir', smokeTimeline.saveFhirRecord);

module.exports = router;
