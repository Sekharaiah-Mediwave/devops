const { Router } = require('../../services/imports');

const router = new Router({
  prefix: '/smoke',
});

const smoke = require('../../controllers/smoke');

router.get('/get-list', smoke.getFhirUnsavedList);
router.post('/sync-fhir', smoke.syncFhir);

module.exports = router;
