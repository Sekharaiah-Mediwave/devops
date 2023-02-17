const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/master',
});

const middleware = require('../middleware');
const config = require('../config/config');
const master = require('../controllers/master');

router.get(
  '/get-by-id',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  master.get
);
router.get(
  '/get-list',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  master.get
);
router.post(
  '/save',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  master.post
);
router.put(
  '/update',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  master.put
);
router.delete(
  '/delete',
  middleware.checkAddUrlToHit(config.userUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  master.delete
);

module.exports = router;
