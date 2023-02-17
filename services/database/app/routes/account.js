const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/account',
});

const account = require('../controllers/account');
const middleware = require('../middleware');
const config = require('../config/config');

router.get('/get-user-data', middleware.checkRoleToFetchOtherUser('cl', 'ma'), account.getUserDetails);
router.get('/my-personal-details', middleware.checkRoleToFetchOtherUser(), account.getUserPersonalDetails);
router.get('/my-profile-information/:profileType', middleware.checkRoleToFetchOtherUser(), account.getProfileInfo);
router.get('/key-health-info', middleware.checkRoleToFetchOtherUser(), account.getKeyHealthInfo);
router.get('/key-contact', middleware.checkRoleToFetchOtherUser(), account.getKeyContact);
router.post('/my-profile-information', middleware.checkRoleToFetchOtherUser(), account.addProfileInfo);
router.post('/key-health-info', middleware.checkRoleToFetchOtherUser(), account.addKeyHealthInfo);
router.post('/key-contact', middleware.checkRoleToFetchOtherUser(), account.addKeyContact);
router.post(
  '/update-mail-send-otp',
  middleware.checkAddUrlToHit(`${config.emailUrl}/email`),
  middleware.checkRoleToFetchOtherUser(),
  account.sendMailToUpdateEmail
);
router.post(
  '/send-two-factor-otp',
  middleware.checkAddUrlToHit(`${config.emailUrl}/email`),
  middleware.checkRoleToFetchOtherUser(),
  account.sendMailForTwoFactorAuth
);
router.put('/update-user', middleware.checkRoleToFetchOtherUser(), account.updateUser);
router.put('/my-personal-details', middleware.checkRoleToFetchOtherUser(), account.updatePersonalDetails);
router.patch('/add-user-trackers', middleware.checkRoleToFetchOtherUser(), account.addUserEnabledTrackers);
router.patch('/update-email', middleware.checkRoleToFetchOtherUser(), account.updateUserEmail);
router.patch('/update-password', middleware.checkRoleToFetchOtherUser(), account.updateUserPassword);
router.patch('/toggle-two-factor-auth', middleware.checkRoleToFetchOtherUser(), account.enableTwoFactorAuth);
router.patch('/update-skin', middleware.checkRoleToFetchOtherUser(), account.updateUserSkin);
router.delete('/logout', middleware.checkRoleToFetchOtherUser(), account.logout);
router.post('/check-create-users', middleware.checkRoleToFetchOtherUser(), account.checkAndCreateUsers);

module.exports = router;
