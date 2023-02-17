const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/coping',
});

const config = require('../config/config');
const coping = require('../controllers/coping');
const middleware = require('../middleware');

router.post('/save', middleware.checkAddUrlToHit(config.databaseUrl), coping.createCoping);
router.get('/get-list', middleware.checkAddUrlToHit(config.databaseUrl), coping.getAllCopingRecord);
router.get('/get-by-uuid/:uuid', middleware.checkAddUrlToHit(config.databaseUrl), coping.getCopingRecordByUuid);
router.get('/get-archived-list', middleware.checkAddUrlToHit(config.databaseUrl), coping.getAllArchivedCoping);
router.put('/update', middleware.checkAddUrlToHit(config.databaseUrl), coping.updateCopingRecord);
router.patch('/toggle-archive', middleware.checkAddUrlToHit(config.databaseUrl), coping.toggleArchiveRecord);
router.delete('/delete', middleware.checkAddUrlToHit(config.databaseUrl), coping.deleteCopingRecord);

router.post('/fhir', coping.saveFhirRecord);

module.exports = router;
