const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/diary',
});
const config = require('../config/config');
const diary = require('../controllers/diary');
const middleware = require('../middleware');

router.get('/get-by-id/:uuid', middleware.checkAddUrlToHit(config.databaseUrl), diary.getById);
router.get('/get-list', middleware.checkAddUrlToHit(config.databaseUrl), diary.getList);
router.get('/get-date-list', middleware.checkAddUrlToHit(config.databaseUrl), diary.getList);
router.post('/save', middleware.checkAddUrlToHit(config.databaseUrl), diary.saveRecord);
router.put('/update', middleware.checkAddUrlToHit(config.databaseUrl), diary.updateRecord);
router.delete('/delete', middleware.checkAddUrlToHit(config.databaseUrl), diary.deleteRecord);

router.post('/fhir', diary.saveFhirRecord);

module.exports = router;
