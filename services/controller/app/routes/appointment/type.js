const { Router } = require('../../services/imports');

const router = new Router({ prefix: '/type', });
const middleware = require('../../middleware');
const config = require('../../config/config');
const appointment = require('../../controllers/appointment');

// Type
router.get('/get-all', middleware.checkAddUrlToHit(config.appointmentUrl), middleware.checkRoles(['a', 'sa', 'p', 'cl']), appointment.get);
router.get('/get-list', middleware.checkAddUrlToHit(config.appointmentUrl), middleware.checkRoles(['a', 'sa', 'p', 'cl']), appointment.get);
router.get('/get', middleware.checkAddUrlToHit(config.appointmentUrl), middleware.checkRoles(['a', 'sa', 'p', 'cl']), appointment.get);
router.post('/save', middleware.checkAddUrlToHit(config.appointmentUrl), middleware.checkRoles(['a', 'sa']), appointment.post);
router.put('/update', middleware.checkAddUrlToHit(config.appointmentUrl), middleware.checkRoles(['a', 'sa']), appointment.put);
router.delete('/delete', middleware.checkAddUrlToHit(config.appointmentUrl), middleware.checkRoles(['a', 'sa']), appointment.delete);

module.exports = router;
