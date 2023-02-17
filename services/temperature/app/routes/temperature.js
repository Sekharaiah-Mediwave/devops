const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/temperature',
});

const config = require('../config/config');
const temperature = require('../controllers/temperature');
const middleware = require('../middleware');

router.get('/get', middleware.checkAddUrlToHit(config.databaseUrl), temperature.getAllTemperature);
router.get('/get-chart-data', middleware.checkAddUrlToHit(config.databaseUrl), temperature.getTemperatureChartData);
router.get('/get-by-uuid/:uuid', middleware.checkAddUrlToHit(config.databaseUrl), temperature.getByUuid);
router.post('/save', middleware.checkAddUrlToHit(config.databaseUrl), temperature.createTemperature);
router.post('/fhir', temperature.saveFhirRecord);
router.put('/update', middleware.checkAddUrlToHit(config.databaseUrl), temperature.updateRecord);
router.delete('/delete', middleware.checkAddUrlToHit(config.databaseUrl), temperature.deleteRecord);
module.exports = router;
