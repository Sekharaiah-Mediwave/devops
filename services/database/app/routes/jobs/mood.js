const { Router } = require('../../services/imports');

const router = new Router({
  prefix: '/mood',
});

const mood = require('../../controllers/mood');

router.get('/get-list', mood.getFhirUnsavedList);
router.post('/sync-fhir', mood.syncFhir);

module.exports = router;
