const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/auth',
});

const email = require('../controllers/email');

router.post('/send-reset-password-mail', email.sendResetPasswordMail);
router.post('/send-sign-up-verification-mail', email.sendAccountVerificationMail);
router.post('/send-login-otp', email.sendLoginOtp);

module.exports = router;
