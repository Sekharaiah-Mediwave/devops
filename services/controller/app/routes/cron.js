const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/cron',
});

const middleware = require('../middleware');
const config = require('../config/config');
const cron = require('../controllers/cron');

router.get('/get-all-lists', middleware.checkAddUrlToHit(config.cronUrl), cron.get);
router.put('/update-schedule', middleware.checkAddUrlToHit(config.cronUrl), cron.put);
router.post('/create-schedule', middleware.checkAddUrlToHit(config.cronUrl), cron.post);
router.delete('/delete-schedule', middleware.checkAddUrlToHit(config.cronUrl), cron.delete);

module.exports = router;
