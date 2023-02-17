const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/goal',
});
const config = require('../config/config');
const goal = require('../controllers/goal');
const middleware = require('../middleware');

// router.get('/get-by-id/:uuid', middleware.checkAddUrlToHit(config.databaseUrl), goal.getById);
// router.get('/get-list', middleware.checkAddUrlToHit(config.databaseUrl), goal.getList);
// router.get('/get-date-list', middleware.checkAddUrlToHit(config.databaseUrl), goal.getList);

router.post('/', middleware.checkAddUrlToHit(config.databaseUrl), goal.createRGoal);
router.get('/steps-by-date', middleware.checkAddUrlToHit(config.databaseUrl), goal.getRGoalsByDate);
router.put('/complete-step/:entry_id', middleware.checkAddUrlToHit(config.databaseUrl), goal.markStepCompleted);
router.put('/status/:goal_id', middleware.checkAddUrlToHit(config.databaseUrl), goal.archiveOrActivateGoal);
router.put('/update/:goal_id', middleware.checkAddUrlToHit(config.databaseUrl), goal.updateRGoal);
router.get('/tasks-left-for-date', middleware.checkAddUrlToHit(config.databaseUrl), goal.checkRGoalTasksLeftForDate);
router.get('/', middleware.checkAddUrlToHit(config.databaseUrl), goal.getAllRGoals);

// router.put('/update', middleware.checkAddUrlToHit(config.databaseUrl), goal.updateRecord);
// router.delete('/delete', middleware.checkAddUrlToHit(config.databaseUrl), goal.deleteRecord);

// router.post('/fhir', goal.saveFhirRecord);

module.exports = router;
