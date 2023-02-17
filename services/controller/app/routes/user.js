const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/user',
});

const middleware = require('../middleware');
const config = require('../config/config');
const user = require('../controllers/user');

router.get(
  '/get-all-clinicians',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['sa', 'a', 'p']),
  user.get
);
router.get(
  '/get-all-clinicians-and-admin',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['sa', 'a', 'p']),
  user.get
);
router.get('/get-all-admin', middleware.checkAddUrlToHit(config.userUrl), middleware.checkRoles(['sa']), user.get);
router.get(
  '/get-admin-community-users',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a']),
  user.get
);
router.get(
  '/get-circle-collegues',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  user.get
);
router.get(
  '/get-circle-peoples',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  user.get
);
router.get(
  '/get-directory-users',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  user.get
);
router.get(
  '/tracker/overview',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p']),
  user.get
);
router.put(
  '/update-profile',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  user.put
);
router.put(
  '/delete-account',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  user.put
);
router.put(
  '/inactive-account',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  user.put
);
router.get(
  '/get-consent',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  user.get
);
router.put(
  '/update-consent',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  user.put
);
router.put(
  '/resource-library/favorite',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  user.put
);
router.put(
  '/resource-library/preference',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  user.put
);
router.get(
  '/resource-library',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  user.get
);
router.get(
  '/audit-trails',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  user.get
);
router.put(
  '/update-directory-settings',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  user.put
);
router.put(
  '/update-account-settings',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  user.put
);
router.post('/create-admin', middleware.checkAddUrlToHit(config.userUrl), middleware.checkRoles(['sa']), user.post);
router.post('/create-clinician', middleware.checkAddUrlToHit(config.userUrl), middleware.checkRoles(['a']), user.post);
router.post('/create-care-team', middleware.checkAddUrlToHit(config.userUrl), middleware.checkRoles(['a']), user.post);
router.post('/create-patient', middleware.checkAddUrlToHit(config.userUrl), middleware.checkRoles(['a']), user.post);
router.get(
  '/get-patient-to-link-and-unlink',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a']),
  user.get
);
router.post(
  '/link-clinician-to-patients',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a']),
  user.post
);
router.post(
  '/link-careteams-to-patients',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a']),
  user.post
);
router.get('/list-careteams', middleware.checkAddUrlToHit(config.userUrl), middleware.checkRoles(['a']), user.get);
router.get(
  '/get-all-users-from-team',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a']),
  user.get
);
router.patch(
  '/remove-circle-connections',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a']),
  user.patch
);
router.patch(
  '/deactivate-connections',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a']),
  user.patch
);
router.patch(
  '/remove-care-team-users',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a']),
  user.patch
);
router.get(
  '/get-users-by-role',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  user.get
);
router.get(
  '/get-user-count-role-wise',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  user.get
);
router.post(
  '/check-email-exist',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  user.post
);
router.post(
  '/get-invited-users',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  user.post
);
router.put(
  '/update-user-module',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['sa']),
  user.put
);
router.get(
  '/get-roles',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['sa']),
  user.get
);
router.put(
  '/update-role-permission',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['sa']),
  user.put
);
// Group routes
router.get(
  '/group/get-by-id/:uuid',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa']),
  user.get
);
router.get(
  '/group/get-list',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa']),
  user.get
);
router.get(
  '/group/get-member-list/:uuid',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa']),
  user.get
);
router.post(
  '/group/save',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa']),
  user.post
);
router.put(
  '/group/update',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa']),
  user.put
);
router.put(
  '/group/change-group-status',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa']),
  user.put
);
router.put(
  '/group/change-member-status',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa']),
  user.put
);
router.delete(
  '/group/:uuid',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa']),
  user.delete
);

// User Role Scope
router.get(
  '/role-scope/:roleId',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['sa']),
  user.get
);
// router.post(
//   '/role-scope',
//   middleware.checkAddUrlToHit(config.userUrl),
//   middleware.checkRoles(['sa']),
//   user.post
// );
router.put(
  '/role-scope',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['sa']),
  user.put
);
module.exports = router;
