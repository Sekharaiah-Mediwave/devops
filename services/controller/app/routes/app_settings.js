const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/app-settings',
});

const middleware = require('../middleware');
const config = require('../config/config');
const appSettings = require('../controllers/app_settings');

router.put(
  '/update',
  middleware.checkAddUrlToHit(config.appSettingsUrl),
  middleware.checkRoles(['sa', 'ma']),
  appSettings.put
);
router.get(
  '/global-setting',
  middleware.checkAddUrlToHit(config.appSettingsUrl),
  middleware.checkRoles(['ma']),
  appSettings.get
);
router.put(
  '/global-setting',
  middleware.checkAddUrlToHit(config.appSettingsUrl),
  middleware.checkRoles(['ma']),
  appSettings.put
);

module.exports = router;
