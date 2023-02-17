const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/health',
});

const middleware = require('../middleware');
const config = require('../config/config');
const health = require('../controllers/health');

router.post(
  '/save-diagnoses',
  middleware.checkAddUrlToHit(config.healthUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  health.post
);
router.get(
  '/get-diagnoses-and-medication-list',
  middleware.checkAddUrlToHit(config.healthUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  health.get
);
router.get(
  '/get-diagnoses-by-uuid/:uuid',
  middleware.checkAddUrlToHit(config.healthUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  health.get
);
router.post(
  '/save-medication',
  middleware.checkAddUrlToHit(config.healthUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  health.post
);
router.put(
  '/update-diagnoses',
  middleware.checkAddUrlToHit(config.healthUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  health.put
);
router.put(
  '/update-medication',
  middleware.checkAddUrlToHit(config.healthUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  health.put
);
router.patch(
  '/toggle-diagnoses-archive',
  middleware.checkAddUrlToHit(config.healthUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  health.patch
);
router.patch(
  '/toggle-medication-archive',
  middleware.checkAddUrlToHit(config.healthUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  health.patch
);
router.get(
  '/get-archived-diagnoses-list',
  middleware.checkAddUrlToHit(config.healthUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  health.get
);
router.get(
  '/get-archived-medication-list',
  middleware.checkAddUrlToHit(config.healthUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  health.get
);
router.delete(
  '/delete-diagnoses',
  middleware.checkAddUrlToHit(config.healthUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  health.delete
);
router.delete(
  '/delete-medication',
  middleware.checkAddUrlToHit(config.healthUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  health.delete
);
router.post(
  '/save-medication-notes',
  middleware.checkAddUrlToHit(config.healthUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  health.post
);
router.put(
  '/update-medication-notes',
  middleware.checkAddUrlToHit(config.healthUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  health.put
);
router.delete(
  '/delete-medication-notes',
  middleware.checkAddUrlToHit(config.healthUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  health.delete
);

/* LifeStyle section */
router.post(
  '/save-activity',
  middleware.checkAddUrlToHit(config.healthUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  health.post
);
router.get(
  '/get-activity',
  middleware.checkAddUrlToHit(config.healthUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  health.get
);
router.patch(
  '/toggle-activity-archive',
  middleware.checkAddUrlToHit(config.healthUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  health.patch
);
router.get(
  '/get-archive-activity-list',
  middleware.checkAddUrlToHit(config.healthUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  health.get
);
router.delete(
  '/delete-activity',
  middleware.checkAddUrlToHit(config.healthUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  health.delete
);
router.put(
  '/update-activity',
  middleware.checkAddUrlToHit(config.healthUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  health.put
);

/* Exercise and Dietary */
router.get(
  '/get-tracker-info',
  middleware.checkAddUrlToHit(config.healthUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  health.get
);
router.post(
  '/save-exercise',
  middleware.checkAddUrlToHit(config.healthUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  health.post
);
router.get(
  '/get-exercise',
  middleware.checkAddUrlToHit(config.healthUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  health.get
);
router.put('/update-exercise', middleware.checkAddUrlToHit(config.healthUrl), health.put);
router.patch('/dietary-and-measurement', middleware.checkAddUrlToHit(config.healthUrl), health.patch);
router.get('/get-dietary-and-measurement', middleware.checkAddUrlToHit(config.healthUrl), health.get);
router.delete('/delete-exercise', middleware.checkAddUrlToHit(config.healthUrl), health.delete);

// router.delete("/delete-activity", middleware.checkAddUrlToHit(config.healthUrl), health.delete);
// router.delete("/delete-activity", middleware.checkAddUrlToHit(config.healthUrl), health.delete);

module.exports = router;
