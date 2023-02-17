const { Router } = require('../../services/imports');

const router = new Router({
  prefix: '/diary',
});

const diary = require('../../controllers/diary');

router.get('/get-list', diary.getFhirUnsavedList);
router.post('/sync-fhir', diary.syncFhir);

module.exports = router;
