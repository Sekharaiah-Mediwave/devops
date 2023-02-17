const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/diary',
});
const middleware = require('../middleware');
const config = require('../config/config');
const diary = require('../controllers/diary');

router.get(
  '/get-by-id/:uuid',
  middleware.checkAddUrlToHit(config.diaryUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  diary.get
);
router.get(
  '/get-list',
  middleware.checkAddUrlToHit(config.diaryUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  diary.get
);
router.get(
  '/get-date-list',
  middleware.checkAddUrlToHit(config.diaryUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  diary.get
);
router.post(
  '/save',
  middleware.checkAddUrlToHit(config.diaryUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  diary.post
);
router.put(
  '/update',
  middleware.checkAddUrlToHit(config.diaryUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  diary.put
);
router.delete(
  '/delete',
  middleware.checkAddUrlToHit(config.diaryUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl']),
  diary.delete
);

module.exports = router;
