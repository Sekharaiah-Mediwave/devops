const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/sleep',
});

const config = require('../config/config');
const sleep = require('../controllers/sleep');
const middleware = require('../middleware');

router.get('/get-by-id/:uuid', middleware.checkAddUrlToHit(config.databaseUrl), sleep.getById);
router.get('/get-list', middleware.checkAddUrlToHit(config.databaseUrl), sleep.getList);
router.get('/get-chart-data', middleware.checkAddUrlToHit(config.databaseUrl), sleep.getChartData);
router.post('/save', middleware.checkAddUrlToHit(config.databaseUrl), sleep.saveRecord);
router.put('/update', middleware.checkAddUrlToHit(config.databaseUrl), sleep.updateRecord);
router.patch('/toggle-archive', middleware.checkAddUrlToHit(config.databaseUrl), sleep.toggleArchiveRecord);
router.delete('/delete', middleware.checkAddUrlToHit(config.databaseUrl), sleep.deleteRecord);

router.post('/fhir', sleep.saveFhirRecord);

module.exports = router;
