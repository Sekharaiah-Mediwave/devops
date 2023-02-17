const { Router } = require('../../services/imports');

const router = new Router({
  prefix: '/coping',
});

const coping = require('../../controllers/coping');

router.get('/get-list', coping.getFhirUnsavedList);
router.post('/sync-fhir', coping.syncFhir);

module.exports = router;
