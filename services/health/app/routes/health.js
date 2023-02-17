const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/health',
});

const config = require('../config/config');
const health = require('../controllers/health');
const middleware = require('../middleware');
/* Current health section */
router.post('/save-diagnoses', middleware.checkAddUrlToHit(config.databaseUrl), health.createDiagnoses);
router.get(
  '/get-diagnoses-and-medication-list',
  middleware.checkAddUrlToHit(config.databaseUrl),
  health.getAllDiagnosesRecord
);
router.get(
  '/get-diagnoses-by-uuid/:uuid',
  middleware.checkAddUrlToHit(config.databaseUrl),
  health.getDiagnosesRecordByUuid
);
router.post('/save-medication', middleware.checkAddUrlToHit(config.databaseUrl), health.createMedication);
router.put('/update-diagnoses', middleware.checkAddUrlToHit(config.databaseUrl), health.updateDiagnosesRecord);
router.put('/update-medication', middleware.checkAddUrlToHit(config.databaseUrl), health.updateMedicationRecord);
router.patch(
  '/toggle-diagnoses-archive',
  middleware.checkAddUrlToHit(config.databaseUrl),
  health.toggleDiagnosesArchiveRecord
);
router.patch(
  '/toggle-medication-archive',
  middleware.checkAddUrlToHit(config.databaseUrl),
  health.toggleMedicationArchiveRecord
);
router.get(
  '/get-archived-diagnoses-list',
  middleware.checkAddUrlToHit(config.databaseUrl),
  health.getAllArchiveDiagnoses
);
router.get(
  '/get-archived-medication-list',
  middleware.checkAddUrlToHit(config.databaseUrl),
  health.getAllArchiveMedication
);
router.delete('/delete-diagnoses', middleware.checkAddUrlToHit(config.databaseUrl), health.deleteDiagnosesRecord);
router.delete('/delete-medication', middleware.checkAddUrlToHit(config.databaseUrl), health.deleteMedicationRecord);

router.post('/save-medication-notes', middleware.checkAddUrlToHit(config.databaseUrl), health.createMedicationNotes);
router.put('/update-medication-notes', middleware.checkAddUrlToHit(config.databaseUrl), health.updateMedicationNotes);
router.delete(
  '/delete-medication-notes',
  middleware.checkAddUrlToHit(config.databaseUrl),
  health.deleteMedicationNotes
);

/* LifeStyle section */
router.post('/save-activity', middleware.checkAddUrlToHit(config.databaseUrl), health.createActivites);
router.get('/get-activity', middleware.checkAddUrlToHit(config.databaseUrl), health.getActivites);
router.patch('/toggle-activity-archive', middleware.checkAddUrlToHit(config.databaseUrl), health.toggleActivityArchive);
router.get('/get-archive-activity-list', middleware.checkAddUrlToHit(config.databaseUrl), health.getArchiveActivites);
router.delete('/delete-activity', middleware.checkAddUrlToHit(config.databaseUrl), health.deleteActivityRecord);
router.put('/update-activity', middleware.checkAddUrlToHit(config.databaseUrl), health.updateActivity);

/* Exercise and Dietary */
router.get('/get-tracker-info', middleware.checkAddUrlToHit(config.databaseUrl), health.getTrackerInfo);
router.post('/save-exercise', middleware.checkAddUrlToHit(config.databaseUrl), health.createExercise);
router.get('/get-exercise', middleware.checkAddUrlToHit(config.databaseUrl), health.getExercise);
router.patch(
  '/dietary-and-measurement',
  middleware.checkAddUrlToHit(config.databaseUrl),
  health.upsertDietaryAndMeasurement
);
router.put('/update-exercise', middleware.checkAddUrlToHit(config.databaseUrl), health.updateExercise);
router.get(
  '/get-dietary-and-measurement',
  middleware.checkAddUrlToHit(config.databaseUrl),
  health.getDietaryAndMeasurement
);
router.delete('/delete-exercise', middleware.checkAddUrlToHit(config.databaseUrl), health.deleteExercise);

module.exports = router;
