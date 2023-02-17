const { Router } = require('../../services/imports');

const router = new Router({
  prefix: '/alcohol',
});

const alcohol = require('../../controllers/alcohol');

router.get('/get-list', alcohol.getFhirUnsavedList);
router.post('/sync-fhir', alcohol.syncFhir);

module.exports = router;
