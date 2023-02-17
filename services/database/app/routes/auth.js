const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/auth',
});

const appSettings = require('../controllers/app_settings');
const auth = require('../controllers/auth');
const middleware = require('../middleware');
const config = require('../config/config');

router.post('/sign-up', middleware.checkRoleToFetchOtherUser(), auth.signUp);
router.post('/login', middleware.checkRoleToFetchOtherUser(), auth.login);
router.post('/generate-qb-token', middleware.checkRoleToFetchOtherUser(), auth.generateQBToken);
router.post('/login-with-otp', middleware.checkRoleToFetchOtherUser(), auth.loginWithOtp);
router.patch(
  '/send-reset-password-mail',
  middleware.checkAddUrlToHit(`${config.emailUrl}/email`),
  middleware.checkRoleToFetchOtherUser(),
  auth.sendResetPasswordMail
);
router.patch('/reset-password', middleware.checkRoleToFetchOtherUser(), auth.resetPassword);
router.post('/get-refresh-token', middleware.checkRoleToFetchOtherUser(), auth.getRefreshToken);
router.get('/get-app-settings', middleware.checkRoleToFetchOtherUser(), appSettings.getUserAppSettings);
router.get('/access-token-sign-up-otp', middleware.checkRoleToFetchOtherUser(), auth.getAccessTokenSignUpOtp);
router.get('/verify-token-valid', middleware.checkRoleToFetchOtherUser(), auth.verifyUserResetToken);
router.patch('/verify-user', middleware.checkRoleToFetchOtherUser(), auth.verifyUserAccount);
router.post('/check-user-exists', middleware.checkRoleToFetchOtherUser(), auth.checkUserAlreadyExists);
router.delete(
  '/delete-user',
  middleware.checkRoleToFetchOtherUser(),
  auth.deleteUser
); /* Not for UI. For internal purpose only */
router.patch('/change-user-role', middleware.checkRoleToFetchOtherUser(), auth.changeUserRole);
router.post('/update-user-invite', middleware.checkRoleToFetchOtherUser(), auth.updateUserInvite);
router.post('/check-create-users', middleware.checkRoleToFetchOtherUser(), auth.checkAndCreateUsers);

module.exports = router;
