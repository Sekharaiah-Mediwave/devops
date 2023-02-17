const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/circle',
});

const middleware = require('../middleware');
const circle = require('../controllers/circle');

router.post('/check-user-available', middleware.checkRoleToFetchOtherUser(), circle.checkUserAvailable);
router.post('/create-user-invite', middleware.checkRoleToFetchOtherUser(), circle.createUserInvite);
router.post('/create-circle', middleware.checkRoleToFetchOtherUser(), circle.createCircle);
router.post('/accept-circle-invite', middleware.checkRoleToFetchOtherUser(), circle.acceptCircleInvite);
router.post('/reject-circle-invite', middleware.checkRoleToFetchOtherUser(), circle.rejectCircleInvite);
router.post('/cancel-circle-invite', middleware.checkRoleToFetchOtherUser(), circle.cancelCircleInvite);
router.get('/get-by-id', middleware.checkRoleToFetchOtherUser(), circle.getById);
router.get('/get-all-circle', middleware.checkRoleToFetchOtherUser(), circle.listUserCircle);
router.get('/get-all-circle-user', middleware.checkRoleToFetchOtherUser(), circle.listUserCircleForNotification);
router.get('/get-community-users', middleware.checkRoleToFetchOtherUser(), circle.getCommunityUsers);
router.get('/request-recieved', middleware.checkRoleToFetchOtherUser(), circle.getRequestReceived);
router.get('/request-sent', middleware.checkRoleToFetchOtherUser(), circle.getRequestSent);
router.patch('/update-modules', middleware.checkRoleToFetchOtherUser(), circle.updateCircle);
router.patch('/remove-circle', middleware.checkRoleToFetchOtherUser(), circle.revokeCircleConnection);
router.get('/get-connected-users-by-id', middleware.checkRoleToFetchOtherUser(), circle.getConnectedUserByUserId);
router.post('/get-circles-from-ids', middleware.checkRoleToFetchOtherUser(), circle.getCirclesFromIds);

module.exports = router;
