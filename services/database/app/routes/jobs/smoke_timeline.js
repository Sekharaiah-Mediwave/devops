const { Router } = require('../../services/imports');

const router = new Router({
  prefix: '/smoke-timeline',
});

const smokeTimeline = require('../../controllers/smoke_timeline');

router.get('/get-list', smokeTimeline.getFhirUnsavedList);
router.post('/sync-fhir', smokeTimeline.syncFhir);

module.exports = router;
