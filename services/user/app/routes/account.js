const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/account',
});

const middleware = require('../middleware');
const config = require('../config/config');
const account = require('../controllers/account');

router.get('/get-user-data', middleware.checkAddUrlToHit(config.databaseUrl), account.getUserDetails);
router.get('/my-personal-details', middleware.checkAddUrlToHit(config.databaseUrl), account.getUserPersonalDetails);
router.get(
  '/my-profile-information/:profileType',
  middleware.checkAddUrlToHit(config.databaseUrl),
  account.getProfileInformation
);
router.get('/key-health-info', middleware.checkAddUrlToHit(config.databaseUrl), account.getUserDetails);
router.get('/key-contact', middleware.checkAddUrlToHit(config.databaseUrl), account.getUserDetails);
router.post('/my-profile-information', middleware.checkAddUrlToHit(config.databaseUrl), account.postProfileInformation);
router.post('/key-health-info', middleware.checkAddUrlToHit(config.databaseUrl), account.postKeyHealthInfo);
router.post('/key-contact', middleware.checkAddUrlToHit(config.databaseUrl), account.postKeyContact);
router.post('/update-mail-send-otp', middleware.checkAddUrlToHit(config.databaseUrl), account.updateMailSendOtp);
router.post('/send-two-factor-otp', middleware.checkAddUrlToHit(config.databaseUrl), account.sendTwoFactorAuthOtp);
router.post('/fhir', account.saveFhirRecord);
router.put('/update-user', middleware.checkAddUrlToHit(config.databaseUrl), account.updateUser);
router.put('/my-personal-details', middleware.checkAddUrlToHit(config.databaseUrl), account.updatePersonalDetails);
router.patch('/add-user-trackers', middleware.checkAddUrlToHit(config.databaseUrl), account.addUserEnabledTrackers);
router.patch('/update-email', middleware.checkAddUrlToHit(config.databaseUrl), account.updateMail);
router.patch('/update-password', middleware.checkAddUrlToHit(config.databaseUrl), account.updatePassword);
router.patch('/toggle-two-factor-auth', middleware.checkAddUrlToHit(config.databaseUrl), account.enableTwoFactorAuth);
router.patch('/update-skin', middleware.checkAddUrlToHit(config.databaseUrl), account.updateUserSkin);
router.delete('/logout', middleware.checkAddUrlToHit(config.databaseUrl), account.logout);
router.post('/check-create-users', middleware.checkAddUrlToHit(config.databaseUrl), account.checkAndCreateUsers);

module.exports = router;
