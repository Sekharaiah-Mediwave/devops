const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/notification',
});
const config = require('../config/config');
const notification = require('../controllers/notification');
const middleware = require('../middleware');

router.post('/', middleware.checkAddUrlToHit(config.databaseUrl), notification.createScheduleNotification);
router.put(
  '/updateNotificationSchedule/:id',
  middleware.checkAddUrlToHit(config.databaseUrl),
  notification.updateScheduleNotification
);
router.get(
  '/getScheduleNotification',
  middleware.checkAddUrlToHit(config.databaseUrl),
  notification.getScheduleNotification
);
router.get('/getNotification', middleware.checkAddUrlToHit(config.databaseUrl), notification.getNotification);
router.get('/getNotificationCount', middleware.checkAddUrlToHit(config.databaseUrl), notification.getNotificationCount);
router.put('/markAsRead', middleware.checkAddUrlToHit(config.databaseUrl), notification.markAsRead);

module.exports = router;
