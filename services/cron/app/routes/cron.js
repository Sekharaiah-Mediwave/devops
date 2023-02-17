const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/cron',
});

const middleware = require('../middleware');
const config = require('../config/index');
const cron = require('../controllers/cron');

router.get('/get-all-lists', middleware.checkAddUrlToHit(config.databaseUrl), cron.getList);
router.put('/update-schedule', middleware.checkAddUrlToHit(config.databaseUrl), cron.updateRecord);
router.post('/create-schedule', middleware.checkAddUrlToHit(config.databaseUrl), cron.saveRecord);
router.delete('/delete-schedule', middleware.checkAddUrlToHit(config.databaseUrl), cron.deleteRecord);

module.exports = router;
