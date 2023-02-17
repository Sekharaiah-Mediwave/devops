const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/app-settings',
});

const appSettings = require('../controllers/app_settings');
const audit = require('./__common');

router.get('/global-setting', audit.appendToAuditTrail, appSettings.getMaiaAdminAppSettings);
router.put('/global-setting', audit.appendToAuditTrail, appSettings.updateMaiaAdminAppSettings);
router.put('/update', audit.appendToAuditTrail, appSettings.updateUserAppSettings);

module.exports = router;
