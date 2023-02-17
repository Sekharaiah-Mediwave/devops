const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/user',
});

const user = require('../controllers/user');

router.post('/send-admin-created', user.adminCreatedMail);
router.post('/send-care-team-created', user.careTeamCreatedMail);
router.post('/send-clinician-created', user.clinicianCreatedMail);
router.post('/send-patient-created', user.patientCreatedMail);

module.exports = router;
