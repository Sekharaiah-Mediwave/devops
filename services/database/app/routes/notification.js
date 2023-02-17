const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/notification',
});

const middleware = require('../middleware');
const notification = require('../controllers/notification');
const audit = require('./__common');

router.post('/', middleware.checkRoleToFetchOtherUser(), notification.createNotificationSchedule);
router.put(
  '/updateNotificationSchedule/:id',
  middleware.checkRoleToFetchOtherUser(),
  notification.updateNotificationSchedule
);
router.get('/getScheduleNotification', middleware.checkRoleToFetchOtherUser(), notification.getNotificationSchedule);
router.get('/getNotification', middleware.checkRoleToFetchOtherUser(), notification.getNotification);
router.get('/getAllNotification', middleware.checkRoleToFetchOtherUser(), notification.getAllNotification);
router.get('/getNotificationCount', middleware.checkRoleToFetchOtherUser(), notification.getNotificationCount);
router.put('/markAsRead', middleware.checkRoleToFetchOtherUser(), notification.markAsRead);

module.exports = router;
