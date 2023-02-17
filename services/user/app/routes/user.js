const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/user',
});

const middleware = require('../middleware');
const config = require('../config/config');
const user = require('../controllers/user');
const group = require('../controllers/group');

router.get('/get-all-clinicians', middleware.checkAddUrlToHit(config.databaseUrl), user.getAllClinicians);
router.get('/get-all-clinicians-and-admin', middleware.checkAddUrlToHit(config.databaseUrl), user.getAllCliniciansAndAdmin);
router.get('/get-all-admin', middleware.checkAddUrlToHit(config.databaseUrl), user.getAllAdmin);
router.get('/get-admin-community-users', middleware.checkAddUrlToHit(config.databaseUrl), user.getCommunityUsers);
router.get('/get-circle-collegues', middleware.checkAddUrlToHit(config.databaseUrl), user.getColleguesFromCircle);
router.get('/get-circle-peoples', middleware.checkAddUrlToHit(config.databaseUrl), user.getPeoplesFromCircle);
router.get('/get-directory-users', middleware.checkAddUrlToHit(config.databaseUrl), user.getUsersFromDirectory);
router.get('/tracker/overview', middleware.checkAddUrlToHit(config.databaseUrl), user.getTrackerOverview);
router.put('/update-profile', middleware.checkAddUrlToHit(config.databaseUrl), user.updateProfile);
router.put('/delete-account', middleware.checkAddUrlToHit(config.databaseUrl), user.deleteAccount);
router.put('/inactive-account', middleware.checkAddUrlToHit(config.databaseUrl), user.inActiveAccount);
router.get('/get-consent', middleware.checkAddUrlToHit(config.databaseUrl), user.getConsent);
router.put('/update-consent', middleware.checkAddUrlToHit(config.databaseUrl), user.updateConsent);
router.put(
  '/resource-library/favorite',
  middleware.checkAddUrlToHit(config.databaseUrl),
  user.updateResourceLibraryFavorite
);
router.put(
  '/resource-library/preference',
  middleware.checkAddUrlToHit(config.databaseUrl),
  user.updateResourceLibraryPreference
);
router.get('/resource-library', middleware.checkAddUrlToHit(config.databaseUrl), user.fetchResourceLibraryPreference);
router.get('/audit-trails', middleware.checkAddUrlToHit(config.databaseUrl), user.fetchAuditTrails);
router.put('/update-directory-settings', middleware.checkAddUrlToHit(config.databaseUrl), user.updateDirectorySettings);
router.put('/update-account-settings', middleware.checkAddUrlToHit(config.databaseUrl), user.updateAccountSettings);
router.post('/create-admin', middleware.checkAddUrlToHit(config.databaseUrl), user.createAdminUser);
router.post('/create-care-team', middleware.checkAddUrlToHit(config.databaseUrl), user.createCareTeam);
router.post('/create-clinician', middleware.checkAddUrlToHit(config.databaseUrl), user.createClinician);
router.post('/create-patient', middleware.checkAddUrlToHit(config.databaseUrl), user.createPatient);
router.get('/get-patient-to-link-and-unlink', middleware.checkAddUrlToHit(config.databaseUrl), user.getPatientsToLink);
router.post(
  '/link-clinician-to-patients',
  middleware.checkAddUrlToHit(config.databaseUrl),
  user.linkClinicianAndPatients
);
router.post(
  '/link-careteams-to-patients',
  middleware.checkAddUrlToHit(config.databaseUrl),
  user.linkCareteamsAndPatients
);
router.get('/list-careteams', middleware.checkAddUrlToHit(config.databaseUrl), user.listCareteams);
router.get('/get-all-users-from-team', middleware.checkAddUrlToHit(config.databaseUrl), user.listUsersInCareteams);
router.patch(
  '/remove-circle-connections',
  middleware.checkAddUrlToHit(config.databaseUrl),
  user.removeUserCircleConnection
);
router.patch('/deactivate-connections', middleware.checkAddUrlToHit(config.databaseUrl), user.deactivateUsers);
router.patch('/remove-care-team-users', middleware.checkAddUrlToHit(config.databaseUrl), user.removeUserFromCareTeam);
router.get('/get-users-by-role', middleware.checkAddUrlToHit(config.databaseUrl), user.getUsersByRole);
router.get('/get-user-count-role-wise', middleware.checkAddUrlToHit(config.databaseUrl), user.getUserCountRoleWise);
router.post('/check-email-exist', middleware.checkAddUrlToHit(config.databaseUrl), user.checkEmailExist);
router.post('/get-invited-users', middleware.checkAddUrlToHit(config.databaseUrl), user.getInvitedUsers);
router.put('/update-user-module', middleware.checkAddUrlToHit(config.databaseUrl), user.updateUserModule);
router.get('/get-roles', middleware.checkAddUrlToHit(config.databaseUrl), user.getRoles);
router.put('/update-role-permission', middleware.checkAddUrlToHit(config.databaseUrl), user.updateRolePermission);
// Group 
router.get('/group/get-by-id/:uuid', middleware.checkAddUrlToHit(config.databaseUrl), group.getById);
router.get('/group/get-list', middleware.checkAddUrlToHit(config.databaseUrl), group.getList);
router.get('/group/get-member-list/:uuid', middleware.checkAddUrlToHit(config.databaseUrl), group.getMemberList);
router.post('/group/save', middleware.checkAddUrlToHit(config.databaseUrl), group.saveRecord);
router.put('/group/update', middleware.checkAddUrlToHit(config.databaseUrl), group.updateRecord);
router.put('/group/change-group-status', middleware.checkAddUrlToHit(config.databaseUrl), group.changeGroupStatus);
router.put('/group/change-member-status', middleware.checkAddUrlToHit(config.databaseUrl), group.changeGroupMemberStatus);
router.delete('/group/:uuid', middleware.checkAddUrlToHit(config.databaseUrl), group.deleteById);
// User Role Scope
router.get('/role-scope/:roleId', middleware.checkAddUrlToHit(config.databaseUrl), user.getRoleScopeById);
router.put('/role-scope', middleware.checkAddUrlToHit(config.databaseUrl), user.updateRoleScopeRecord);


module.exports = router;
