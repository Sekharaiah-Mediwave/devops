const { Router } = require('../../services/imports');

const router = new Router({
  prefix: '/bmi',
});

const bmi = require('../../controllers/bmi');

router.get('/get-list', bmi.getFhirUnsavedList);
router.post('/sync-fhir', bmi.syncFhir);

module.exports = router;
