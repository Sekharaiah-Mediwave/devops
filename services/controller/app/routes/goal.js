const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/goal',
});
const middleware = require('../middleware');
const config = require('../config/config');
const goal = require('../controllers/goal');

router.post('/', middleware.checkAddUrlToHit(config.goalUrl), middleware.checkRoles(['a', 'sa', 'p', 'cl']), goal.post);
router.get(
  '/steps-by-date',
  middleware.checkAddUrlToHit(config.goalUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  goal.get
);
router.put(
  '/complete-step/:entry_id',
  middleware.checkAddUrlToHit(config.goalUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  goal.put
);
router.put(
  '/status/:goal_id',
  middleware.checkAddUrlToHit(config.goalUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  goal.put
);
router.put(
  '/update/:goal_id',
  middleware.checkAddUrlToHit(config.goalUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  goal.put
);
router.get(
  '/tasks-left-for-date',
  middleware.checkAddUrlToHit(config.goalUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  goal.get
);
router.get('/', middleware.checkAddUrlToHit(config.goalUrl), middleware.checkRoles(['a', 'sa', 'p', 'cl']), goal.get);

module.exports = router;
