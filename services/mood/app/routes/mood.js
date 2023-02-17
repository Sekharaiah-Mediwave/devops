const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/mood',
});
const config = require('../config/config');
const mood = require('../controllers/mood');
const middleware = require('../middleware');

router.get('/get-by-id/:uuid', middleware.checkAddUrlToHit(config.databaseUrl), mood.getById);
router.get('/get-list', middleware.checkAddUrlToHit(config.databaseUrl), mood.getList);
router.get('/get-chart-data', middleware.checkAddUrlToHit(config.databaseUrl), mood.getChartData);
router.post('/save', middleware.checkAddUrlToHit(config.databaseUrl), mood.saveRecord);
router.post('/fhir', mood.saveFhirRecord);
router.put('/update', middleware.checkAddUrlToHit(config.databaseUrl), mood.updateRecord);
router.delete('/delete', middleware.checkAddUrlToHit(config.databaseUrl), mood.deleteRecord);

module.exports = router;
