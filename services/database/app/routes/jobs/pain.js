const { Router } = require('../../services/imports');

const router = new Router({
  prefix: '/pain',
});

const pain = require('../../controllers/pain');

router.get('/get-list', pain.getFhirUnsavedList);
router.post('/sync-fhir', pain.syncFhir);

module.exports = router;
