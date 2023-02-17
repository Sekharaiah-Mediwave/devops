const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/upload',
});

const middleware = require('../middleware');
const config = require('../config/config');
const upload = require('../controllers/upload');

router.post(
  '/file',
  middleware.checkAddUrlToHit(config.uploadUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  upload.post
);
router.delete(
  '/delete-file',
  middleware.checkAddUrlToHit(config.uploadUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  upload.delete
);

module.exports = router;
