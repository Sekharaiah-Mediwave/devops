const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/circle',
});

const circleEmail = require('../controllers/circle');

router.post('/invite-user', circleEmail.sendUserInvite);
router.post('/circle-connect', circleEmail.circleConnect);

module.exports = router;
