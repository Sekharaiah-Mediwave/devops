const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/pain',
});

const config = require('../config/config');
const pain = require('../controllers/pain');
const middleware = require('../middleware');

router.get('/get-list', middleware.checkAddUrlToHit(config.databaseUrl), pain.getPainList);
router.get('/get-by-id/:uuid', middleware.checkAddUrlToHit(config.databaseUrl), pain.getPainById);
router.post('/save', middleware.checkAddUrlToHit(config.databaseUrl), pain.createPain);
router.patch('/toggle-archive', middleware.checkAddUrlToHit(config.databaseUrl), pain.toggleArchivePain);
router.delete('/delete', middleware.checkAddUrlToHit(config.databaseUrl), pain.deletePain);

router.post('/save-record', middleware.checkAddUrlToHit(config.databaseUrl), pain.createPainRecord);
router.put('/update-record', middleware.checkAddUrlToHit(config.databaseUrl), pain.updatePainRecord);
router.get('/get-record-list', middleware.checkAddUrlToHit(config.databaseUrl), pain.getPainRecordList);
router.get('/get-chart-data', middleware.checkAddUrlToHit(config.databaseUrl), pain.getPainRecordChartData);
router.get('/get-record-by-id/:uuid', middleware.checkAddUrlToHit(config.databaseUrl), pain.getPainRecordById);
router.patch('/toggle-archive-record', middleware.checkAddUrlToHit(config.databaseUrl), pain.toggleArchivePainRecord);
router.delete('/delete-record', middleware.checkAddUrlToHit(config.databaseUrl), pain.deletePainRecord);

router.post('/fhir', pain.saveFhirRecord);

module.exports = router;
