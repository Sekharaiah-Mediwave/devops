const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/bmi',
});
const config = require('../config/config');
const bmi = require('../controllers/bmi');
const middleware = require('../middleware');

router.get('/get-by-uuid/:uuid', middleware.checkAddUrlToHit(config.databaseUrl), bmi.getByUuid);
router.get('/get-list', middleware.checkAddUrlToHit(config.databaseUrl), bmi.getList);
router.get('/get-chart-data', middleware.checkAddUrlToHit(config.databaseUrl), bmi.getChartData);
router.get('/get-last-entry', middleware.checkAddUrlToHit(config.databaseUrl), bmi.getLastEntry);
router.post('/save', middleware.checkAddUrlToHit(config.databaseUrl), bmi.saveRecord);
router.put('/update', middleware.checkAddUrlToHit(config.databaseUrl), bmi.updateRecord);
router.post('/fhir', bmi.saveFhirRecord);
router.delete('/delete', middleware.checkAddUrlToHit(config.databaseUrl), bmi.deleteRecord);

module.exports = router;
