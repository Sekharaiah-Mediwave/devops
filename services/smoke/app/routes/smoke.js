const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/smoke',
});

const config = require('../config/config');
const smoke = require('../controllers/smoke');
const middleware = require('../middleware');

router.get('/get-by-id/:uuid', middleware.checkAddUrlToHit(config.databaseUrl), smoke.getById);
router.get('/get-list', middleware.checkAddUrlToHit(config.databaseUrl), smoke.getList);
router.get('/get-chart-data', middleware.checkAddUrlToHit(config.databaseUrl), smoke.getChartData);
router.post('/save', middleware.checkAddUrlToHit(config.databaseUrl), smoke.saveRecord);
router.put('/update', middleware.checkAddUrlToHit(config.databaseUrl), smoke.updateRecord);
router.patch('/toggle-archive', middleware.checkAddUrlToHit(config.databaseUrl), smoke.toggleArchiveRecord);
router.delete('/delete', middleware.checkAddUrlToHit(config.databaseUrl), smoke.deleteRecord);

router.post('/fhir', smoke.saveFhirRecord);

module.exports = router;
