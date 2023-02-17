const { Router } = require('../../services/imports');

const router = new Router({
  prefix: '/problem',
});

const problem = require('../../controllers/problem');

router.get('/get-list', problem.getFhirUnsavedList);
router.post('/sync-fhir', problem.syncFhir);

module.exports = router;
