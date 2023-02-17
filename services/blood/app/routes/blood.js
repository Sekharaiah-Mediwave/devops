const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/blood-pressure',
});
const config = require('../config/config');
const blood = require('../controllers/blood');
const middleware = require('../middleware');

router.get('/get-by-uuid/:uuid', middleware.checkAddUrlToHit(config.databaseUrl), blood.getByUuid);
router.get('/get-list', middleware.checkAddUrlToHit(config.databaseUrl), blood.getList);
router.get('/get-chart-data', middleware.checkAddUrlToHit(config.databaseUrl), blood.getChartData);
router.post('/save', middleware.checkAddUrlToHit(config.databaseUrl), blood.saveRecord);
router.post('/fhir', blood.saveFhirRecord);
router.put('/update', middleware.checkAddUrlToHit(config.databaseUrl), blood.updateRecord);
router.delete('/delete', middleware.checkAddUrlToHit(config.databaseUrl), blood.deleteRecord);

module.exports = router;
