const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/account',
});

const middleware = require('../middleware');
const config = require('../config/config');
const user = require('../controllers/user');

router.get(
  '/get-user-data',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl', 'ma']),
  user.get
);
router.get(
  '/my-personal-details',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl', 'ma']),
  user.get
);
router.get(
  '/my-profile-information/:profileType',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  user.get
);
router.get(
  '/key-health-info',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  user.get
);
router.get(
  '/key-contact',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  user.get
);
router.post(
  '/my-profile-information',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  user.post
);
router.post(
  '/key-health-info',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  user.post
);
router.post(
  '/key-contact',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  user.post
);
router.post(
  '/update-mail-send-otp',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  user.post
);
router.post(
  '/send-two-factor-otp',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  user.post
);
router.put(
  '/update-user',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  user.put
);
router.put(
  '/my-personal-details',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  user.put
);
router.patch(
  '/add-user-trackers',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  user.patch
);
router.patch(
  '/update-email',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  user.patch
);
router.patch(
  '/update-password',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  user.patch
);
router.patch(
  '/toggle-two-factor-auth',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  user.patch
);
router.patch(
  '/update-skin',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  user.patch
);
router.delete(
  '/logout',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  user.delete
);
router.post(
  '/check-create-users',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  user.post
);

module.exports = router;
