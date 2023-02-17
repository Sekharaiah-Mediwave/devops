const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/auth',
});

const middleware = require('../middleware');
const config = require('../config/config');
const auth = require('../controllers/auth');

router.post('/sign-up', middleware.checkAddUrlToHit(config.authUrl), auth.post);
router.post('/login-with-otp', middleware.checkAddUrlToHit(config.authUrl), auth.post);
router.post('/login', middleware.checkAddUrlToHit(config.authUrl), auth.post);
router.post('/generate-qb-token', middleware.checkAddUrlToHit(config.authUrl), middleware.isAuthorized, auth.post);
router.patch('/send-reset-password-mail', middleware.checkAddUrlToHit(config.authUrl), auth.patch);
router.patch('/reset-password', middleware.checkAddUrlToHit(config.authUrl), auth.patch);
router.get('/get-app-settings', middleware.checkAddUrlToHit(config.authUrl), auth.get);
router.get('/access-token-sign-up-otp', middleware.checkAddUrlToHit(config.authUrl), auth.get);
router.post('/get-refresh-token', middleware.checkAddUrlToHit(config.authUrl), auth.post);
router.post('/third-party-auth', middleware.checkAddUrlToHit(config.authUrl), auth.post);
router.get('/verify-token-valid', middleware.checkAddUrlToHit(config.authUrl), auth.get);
router.patch('/verify-user', middleware.checkAddUrlToHit(config.authUrl), auth.patch);
router.get('/nhs-user-data', middleware.checkAddUrlToHit(config.authUrl), auth.get);
router.post('/check-user-exists', middleware.checkAddUrlToHit(config.authUrl), auth.post);
router.delete(
  '/delete-user',
  middleware.checkAddUrlToHit(config.authUrl),
  auth.delete
); /* Not for UI. For internal purpose only */
router.patch('/change-user-role', middleware.checkAddUrlToHit(config.authUrl), auth.patch);
router.post('/update-user-invite', middleware.checkAddUrlToHit(config.authUrl), auth.post);
router.post('/check-create-users', middleware.checkAddUrlToHit(config.authUrl), auth.post);

module.exports = router;
