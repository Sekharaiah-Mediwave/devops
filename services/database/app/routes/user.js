const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/user',
});

const user = require('../controllers/user');
const group = require('../controllers/group');

router.get('/get-all-admin', user.getAllAdmin);
router.get('/get-all-clinicians', user.getAllClinicians);
router.get('/get-all-clinicians-and-admin', user.getAllCliniciansAndAdmin);
router.get('/get-admin-community-users', user.getCommunityUsers);
router.get('/get-circle-collegues', user.getColleguesFromCircle);
router.get('/get-circle-peoples', user.getPeoplesFromCircle);
router.get('/get-directory-users', user.getUsersFromDirectory);
router.get('/tracker/overview', user.getTrackerOverview);
router.put('/update-profile', user.updateProfile);
router.get('/get-consent', user.getConsent);
router.put('/update-consent', user.updateConsent);
router.put('/delete-account', user.deleteAccount);
router.put('/inactive-account', user.inActiveAccount);
router.put('/resource-library/favorite', user.addResourceLibraryFavorite);
router.put('/resource-library/preference', user.updateResourceLibraryPreference);
router.get('/resource-library', user.fetchResourceLibrary);
router.get('/audit-trails', user.fetchAuditTrails);
router.put('/update-directory-settings', user.updateDirectorySettings);
router.put('/update-account-settings', user.updateAccountSettings);
router.post('/create-admin', user.createAdminUser);
router.post('/create-care-team', user.createCareTeam);
router.post('/create-clinician', user.createClinician);
router.post('/create-patient', user.createPatient);
router.get('/get-patient-to-link-and-unlink', user.getPatientsToLinkUnlink);
router.post('/is-clinician-available', user.checkClinicianAvailable);
router.post('/is-patients-available', user.checkPatientsAvailable);
router.post('/link-clinician-to-patients', user.linkClinicianAndPatients);
router.post('/is-careteam-available', user.checkCareteamAvailable);
router.post('/link-careteams-to-patients', user.linkCareteamsAndPatients);
router.get('/list-careteams', user.listCareteams);
router.get('/get-all-users-from-team', user.listUsersInCareteam);
router.patch('/remove-circle-connections', user.removeUserCircleConnection);
router.patch('/deactivate-connections', user.deactivateUsers);
router.post('/care-team-circles', user.getCareTeamCircles);
router.patch('/remove-care-team-users', user.removeUserFromCareTeam);
router.post('/unlink-careteams-with-patients', user.unLinkCareteamsAndPatients);
router.get('/get-users-by-role', user.getUserByRole);
router.get('/get-user-count-role-wise', user.getUserCountRoleWise);
router.post('/check-email-exist', user.checkEmailExist);
router.post('/get-invited-users', user.getInvitedUsers);
router.put('/update-user-module', user.updateUserModule);
router.get('/get-roles', user.getRoles);
router.put('/update-role-permission', user.updateRolePermission);

// Group
router.get('/group/get-by-id/:uuid', group.getById);
router.get('/group/get-list', group.getList);
router.get('/group/get-member-list/:uuid', group.getMemberList);
router.post('/group/save', group.saveRecord);
router.put('/group/update', group.updateRecord);
router.put('/group/change-group-status', group.changeGroupStatus);
router.put('/group/change-member-status', group.changeGroupMemberStatus);
router.delete('/group/:uuid', group.deleteById);

// User Role Scope
router.get('/role-scope/:roleId', user.getUserRoleScopeById);
router.put('/role-scope', user.updateUserRoleScope);

module.exports = router;
