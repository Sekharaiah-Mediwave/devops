const { Router } = require('../../services/imports');

const router = new Router({ prefix: '/status', });
const middleware = require('../../middleware');
const config = require('../../config/config');
const appointmentStatus = require('../../controllers/appointment-status');

// Status
router.get('/get-all', middleware.checkAddUrlToHit(config.databaseUrl), appointmentStatus.getAllStatus);
router.post('/get-list', middleware.checkAddUrlToHit(config.databaseUrl), appointmentStatus.getList);
router.get('/get', middleware.checkAddUrlToHit(config.databaseUrl), appointmentStatus.getById);
router.post('/save', middleware.checkAddUrlToHit(config.databaseUrl), appointmentStatus.saveRecord);
router.put('/update', middleware.checkAddUrlToHit(config.databaseUrl), appointmentStatus.updateRecord);
router.delete('/delete', middleware.checkAddUrlToHit(config.databaseUrl), appointmentStatus.deleteById);

module.exports = router;
