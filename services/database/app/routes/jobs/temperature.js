const { Router } = require('../../services/imports');

const router = new Router({
  prefix: '/temperature',
});

const temperature = require('../../controllers/temperature');

router.get('/get-list', temperature.getFhirUnsavedList);
router.post('/sync-fhir', temperature.syncFhir);

module.exports = router;
