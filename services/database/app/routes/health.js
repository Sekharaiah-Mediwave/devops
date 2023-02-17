const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/health',
});

const middleware = require('../middleware');
const health = require('../controllers/health');
const audit = require('./__common');

router.post(
  '/save-diagnoses',
  middleware.checkRoleToFetchOtherUser(),
  audit.appendToAuditTrail,
  health.createDiagnoses
);
router.get('/get-diagnoses-and-medication-list', middleware.checkRoleToFetchOtherUser(), health.getAllDiagnosesRecord);
router.get(
  '/get-diagnoses-by-uuid/:uuid',
  middleware.checkRoleToFetchOtherUser(),
  audit.appendToAuditTrail,
  health.getDiagnosesRecordByUuid
);
router.post('/save-medication', middleware.checkRoleToFetchOtherUser(), health.createMedication);
router.put(
  '/update-diagnoses',
  middleware.checkRoleToFetchOtherUser(),
  audit.appendToAuditTrail,
  health.updateDiagnosesRecord
);
router.put('/update-medication', middleware.checkRoleToFetchOtherUser(), health.updateMedicationRecord);
router.patch('/toggle-diagnoses-archive', middleware.checkRoleToFetchOtherUser(), health.toggleDiagnosesArchived);
router.patch('/toggle-medication-archive', middleware.checkRoleToFetchOtherUser(), health.toggleMedicationArchived);
router.get('/get-archived-diagnoses-list', middleware.checkRoleToFetchOtherUser(), health.getAllArchivedDiagnoses);
router.get('/get-archived-medication-list', middleware.checkRoleToFetchOtherUser(), health.getAllArchivedMedication);
router.delete(
  '/delete-diagnoses',
  middleware.checkRoleToFetchOtherUser(),
  audit.appendToAuditTrail,
  health.deleteDiagnoses
);
router.delete('/delete-medication', middleware.checkRoleToFetchOtherUser(), health.deleteMedication);

router.post('/save-medication-notes', middleware.checkRoleToFetchOtherUser(), health.createMedicationNotes);
router.put('/update-medication-notes', middleware.checkRoleToFetchOtherUser(), health.updateMedicationNotes);
router.delete('/delete-medication-notes', middleware.checkRoleToFetchOtherUser(), health.deleteMedicationNotes);

/* Activity section */
router.post('/save-activity', middleware.checkRoleToFetchOtherUser(), health.createActivity);
router.get('/get-activity', middleware.checkRoleToFetchOtherUser(), health.getActivites);
router.patch('/toggle-activity-archive', middleware.checkRoleToFetchOtherUser(), health.toggleActivityArchived);
router.get('/get-archive-activity-list', middleware.checkRoleToFetchOtherUser(), health.getAllArchivedActivity);
router.delete('/delete-activity', middleware.checkRoleToFetchOtherUser(), health.deleteActivity);
router.put('/update-activity', middleware.checkRoleToFetchOtherUser(), health.updateActivity);

/* Exercise and Diertary and Mesurement  */
router.get('/get-tracker-info', middleware.checkRoleToFetchOtherUser(), health.getTrackerInfo);
router.post('/save-exercise', middleware.checkRoleToFetchOtherUser(), health.createExercise);
router.get('/get-exercise', middleware.checkRoleToFetchOtherUser(), health.getExercise);
router.patch('/dietary-and-measurement', middleware.checkRoleToFetchOtherUser(), health.upsertDietaryAndMeasurement);
router.put('/update-exercise', middleware.checkRoleToFetchOtherUser(), health.updateExercise);
router.get('/get-dietary-and-measurement', middleware.checkRoleToFetchOtherUser(), health.getDiertaryAndMesurement);
router.delete('/delete-exercise', middleware.checkRoleToFetchOtherUser(), health.deleteExercise);

module.exports = router;
