const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/auth',
});

const middleware = require('../middleware');
const config = require('../config/config');
const auth = require('../controllers/auth');

router.post('/login-with-otp', middleware.checkAddUrlToHit(config.databaseUrl), auth.loginWithOtp);
router.post('/login', middleware.checkAddUrlToHit(config.databaseUrl), auth.login);
router.post('/sign-up', middleware.checkAddUrlToHit(config.databaseUrl), auth.signUp);
router.post('/generate-qb-token', middleware.checkAddUrlToHit(config.databaseUrl), auth.generateQBToken);
router.patch('/send-reset-password-mail', middleware.checkAddUrlToHit(config.databaseUrl), auth.sendResetPasswordMail);
router.patch('/reset-password', middleware.checkAddUrlToHit(config.databaseUrl), auth.resetPassword);
router.get('/get-app-settings', middleware.checkAddUrlToHit(config.databaseUrl), auth.getAppSettings);
router.get('/access-token-sign-up-otp', middleware.checkAddUrlToHit(config.databaseUrl), auth.getAccessTokenSignUpOtp);
router.post('/get-refresh-token', middleware.checkAddUrlToHit(config.databaseUrl), auth.getRefreshToken);
router.post('/third-party-auth', middleware.checkAddUrlToHit(config.databaseUrl), auth.thirdPartyAuth);
router.get('/verify-token-valid', middleware.checkAddUrlToHit(config.databaseUrl), auth.verifyUserResetToken);
router.patch('/verify-user', middleware.checkAddUrlToHit(config.databaseUrl), auth.verifyUserAccount);
router.get('/nhs-user-data', middleware.checkAddUrlToHit(config.databaseUrl), auth.getUserDataFromNhs);
router.post('/check-user-exists', middleware.checkAddUrlToHit(config.databaseUrl), auth.checkUserAlreadyExists);
router.delete(
  '/delete-user',
  middleware.checkAddUrlToHit(config.databaseUrl),
  auth.deleteUser
); /* Not for UI. For internal purpose only */
router.patch('/change-user-role', middleware.checkAddUrlToHit(config.databaseUrl), auth.changeUserRole);
router.post('/update-user-invite', middleware.checkAddUrlToHit(config.databaseUrl), auth.updateUserInvite);
router.post('/check-create-users', middleware.checkAddUrlToHit(config.databaseUrl), auth.checkAndCreateUsers);

module.exports = router;
