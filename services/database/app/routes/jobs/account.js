const { Router } = require('../../services/imports');

const router = new Router({
  prefix: '/account',
});

const account = require('../../controllers/account');

router.get('/get-list', account.getFhirUnsavedList);
router.post('/sync-fhir', account.syncFhir);

module.exports = router;
