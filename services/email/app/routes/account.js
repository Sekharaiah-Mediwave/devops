const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/account',
});

const email = require('../controllers/email');

router.post('/update-mail-send-otp', email.sendMailToUpdateEmail);
router.post('/send-account-mail-updated', email.sendAccountMailUpdated);
router.post('/send-two-factor-otp', email.sendMailForTwoFactorAuth);

module.exports = router;
