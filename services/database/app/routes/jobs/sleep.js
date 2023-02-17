const { Router } = require('../../services/imports');

const router = new Router({
  prefix: '/sleep',
});

const sleep = require('../../controllers/sleep');

router.get('/get-list', sleep.getFhirUnsavedList);
router.post('/sync-fhir', sleep.syncFhir);

module.exports = router;
