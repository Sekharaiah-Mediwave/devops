const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/cron',
});

const cron = require('../controllers/cron');

router.get('/get-all-lists', cron.getAllLists);
router.put('/update-schedule', cron.updateSchedule);
router.post('/create-schedule', cron.createSchedule);
router.delete('/delete-schedule', cron.deleteSchedule);

module.exports = router;
