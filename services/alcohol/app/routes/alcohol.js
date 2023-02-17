const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/alcohol',
});

const config = require('../config/config');
const alcohol = require('../controllers/alcohol');
const middleware = require('../middleware');

router.get('/get-by-id/:uuid', middleware.checkAddUrlToHit(config.databaseUrl), alcohol.getById);
router.get('/get-list', middleware.checkAddUrlToHit(config.databaseUrl), alcohol.getList);
router.get('/get-chart-data', middleware.checkAddUrlToHit(config.databaseUrl), alcohol.getChartData);
router.post('/save', middleware.checkAddUrlToHit(config.databaseUrl), alcohol.saveRecord);
router.post('/fhir', alcohol.saveFhirRecord);
router.put('/update', middleware.checkAddUrlToHit(config.databaseUrl), alcohol.updateRecord);
router.patch('/toggle-archive', middleware.checkAddUrlToHit(config.databaseUrl), alcohol.toggleArchiveRecord);
router.delete('/delete', middleware.checkAddUrlToHit(config.databaseUrl), alcohol.deleteRecord);

module.exports = router;
