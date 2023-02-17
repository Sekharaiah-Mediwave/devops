const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/problem',
});

const config = require('../config/config');
const problem = require('../controllers/problem');
const middleware = require('../middleware');

router.get('/get-list', middleware.checkAddUrlToHit(config.databaseUrl), problem.getProblemList);
router.get('/get-by-id/:uuid', middleware.checkAddUrlToHit(config.databaseUrl), problem.getProblemById);
router.post('/save', middleware.checkAddUrlToHit(config.databaseUrl), problem.createProblem);
router.patch('/toggle-archive', middleware.checkAddUrlToHit(config.databaseUrl), problem.toggleArchiveProblem);
router.delete('/delete', middleware.checkAddUrlToHit(config.databaseUrl), problem.deleteProblem);

router.post('/save-record', middleware.checkAddUrlToHit(config.databaseUrl), problem.createProblemRecord);
router.put('/update-record', middleware.checkAddUrlToHit(config.databaseUrl), problem.updateProblemRecord);
router.get('/get-record-list', middleware.checkAddUrlToHit(config.databaseUrl), problem.getProblemRecordList);
router.get('/get-chart-data', middleware.checkAddUrlToHit(config.databaseUrl), problem.getProblemRecordChartData);
router.get('/get-record-by-id/:uuid', middleware.checkAddUrlToHit(config.databaseUrl), problem.getProblemRecordById);
router.patch(
  '/toggle-archive-record',
  middleware.checkAddUrlToHit(config.databaseUrl),
  problem.toggleArchiveProblemRecord
);
router.delete('/delete-record', middleware.checkAddUrlToHit(config.databaseUrl), problem.deleteProblemRecord);

router.post('/fhir', problem.saveFhirRecord);

module.exports = router;
