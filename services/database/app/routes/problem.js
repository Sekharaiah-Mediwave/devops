const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/problem',
});

const middleware = require('../middleware');
const problem = require('../controllers/problem');
const audit = require('./__common');

router.post('/save', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, problem.saveProblem);
router.get('/get-list', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, problem.getProblemList);
router.get('/get-by-id/:uuid', middleware.checkRoleToFetchOtherUser(), problem.getProblemById);
router.patch('/toggle-archive', middleware.checkRoleToFetchOtherUser(), problem.toggleArchiveProblem);
router.delete('/delete', middleware.checkRoleToFetchOtherUser(), audit.appendToAuditTrail, problem.deleteProblem);

router.post('/save-record', middleware.checkRoleToFetchOtherUser(), problem.saveProblemRecord);
router.put('/update-record', middleware.checkRoleToFetchOtherUser(), problem.updateProblemRecord);
router.get('/get-record-list', middleware.checkRoleToFetchOtherUser(), problem.getProblemRecordList);
router.get('/get-record-by-id/:uuid', middleware.checkRoleToFetchOtherUser(), problem.getProblemRecordById);
router.get('/get-chart-data', middleware.checkRoleToFetchOtherUser(), problem.getRecordChartData);
router.patch('/toggle-archive-record', middleware.checkRoleToFetchOtherUser(), problem.toggleArchiveProblemRecord);
router.delete('/delete-record', middleware.checkRoleToFetchOtherUser(), problem.deleteProblemRecord);

module.exports = router;
