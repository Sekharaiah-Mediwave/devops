const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/app-settings',
});
const config = require('../config/config');
const appSettings = require('../controllers/app_settings');
const middleware = require('../middleware');

router.get('/get', middleware.checkAddUrlToHit(config.databaseUrl), appSettings.getByUuid);
router.put('/update', middleware.checkAddUrlToHit(config.databaseUrl), appSettings.updateRecord);
router.get('/global-setting', middleware.checkAddUrlToHit(config.databaseUrl), appSettings.getMaiaUserSettings); //
router.put('/global-setting', middleware.checkAddUrlToHit(config.databaseUrl), appSettings.updateMaiaUser);

module.exports = router;
