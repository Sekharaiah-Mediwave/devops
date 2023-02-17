const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/notification',
});
const middleware = require('../middleware');
const config = require('../config/config');
const notification = require('../controllers/notification');

router.post(
  '/',
  middleware.checkAddUrlToHit(config.notificationUrl),
  middleware.checkRoles(['a', 'sa', 'cl', 'ma']),
  notification.post
);
router.put(
  '/updateNotificationSchedule/:id',
  middleware.checkAddUrlToHit(config.notificationUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl', 'ma']),
  notification.put
);
router.get(
  '/getScheduleNotification',
  middleware.checkAddUrlToHit(config.notificationUrl),
  middleware.checkRoles(['a', 'sa', 'cl']),
  notification.get
);
router.get(
  '/getNotification',
  middleware.checkAddUrlToHit(config.notificationUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl', 'ma']),
  notification.get
);
router.get(
  '/getNotificationCount',
  middleware.checkAddUrlToHit(config.notificationUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl', 'ma']),
  notification.get
);
router.put(
  '/markAsRead',
  middleware.checkAddUrlToHit(config.notificationUrl),
  middleware.checkRoles(['a', 'sa', 'p', 'cl', 'ma']),
  notification.put
);

module.exports = router;
