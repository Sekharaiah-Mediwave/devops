const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/circle',
});

const config = require('../config/config');
const circle = require('../controllers/circle');
const middleware = require('../middleware');

router.post('/invite', middleware.checkAddUrlToHit(config.databaseUrl), circle.inviteUser);
router.post('/accept-circle-invite', middleware.checkAddUrlToHit(config.databaseUrl), circle.acceptCircleInvite);
router.post('/reject-circle-invite', middleware.checkAddUrlToHit(config.databaseUrl), circle.rejectCircleInvite);
router.post('/cancel-circle-invite', middleware.checkAddUrlToHit(config.databaseUrl), circle.cancelCircleInvite);
router.get('/get-all-circle', middleware.checkAddUrlToHit(config.databaseUrl), circle.getAllCircle);
router.get('/get-all-circle-user', middleware.checkAddUrlToHit(config.databaseUrl), circle.getAllCircleUser);
router.get('/get-community-users', middleware.checkAddUrlToHit(config.databaseUrl), circle.getCommunityUsers);
router.get('/request-recieved', middleware.checkAddUrlToHit(config.databaseUrl), circle.getRequestReceived);
router.get('/get-by-id', middleware.checkAddUrlToHit(config.databaseUrl), circle.getById);
router.get('/request-sent', middleware.checkAddUrlToHit(config.databaseUrl), circle.getRequestSent);
router.get(
  '/get-connected-users-by-id',
  middleware.checkAddUrlToHit(config.databaseUrl),
  circle.getConnectedUserByUserId
);
router.patch('/update-modules', middleware.checkAddUrlToHit(config.databaseUrl), circle.updateCircle);
router.patch('/remove-circle', middleware.checkAddUrlToHit(config.databaseUrl), circle.revokeCircleConnection);

module.exports = router;
