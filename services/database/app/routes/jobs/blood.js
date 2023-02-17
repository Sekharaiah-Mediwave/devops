const { Router } = require('../../services/imports');

const router = new Router({
  prefix: '/blood-pressure',
});

const blood = require('../../controllers/blood');

router.get('/get-list', blood.getFhirUnsavedList);
router.post('/sync-fhir', blood.syncFhir);

module.exports = router;
