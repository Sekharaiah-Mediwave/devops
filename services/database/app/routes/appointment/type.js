const { Router } = require('../../services/imports');

const router = new Router({ prefix: '/type', });
const middleware = require('../../middleware');
const config = require('../../config/config');
const appointmentType = require('../../controllers/appointment-type');

// Type
router.get('/get-all', middleware.checkAddUrlToHit(config.databaseUrl), appointmentType.getAllTypes);
router.post('/get-list', middleware.checkAddUrlToHit(config.databaseUrl), appointmentType.getList);
router.get('/get', middleware.checkAddUrlToHit(config.databaseUrl), appointmentType.getById);
router.post('/save', middleware.checkAddUrlToHit(config.databaseUrl), appointmentType.saveRecord);
router.put('/update', middleware.checkAddUrlToHit(config.databaseUrl), appointmentType.updateRecord);
router.delete('/delete', middleware.checkAddUrlToHit(config.databaseUrl), appointmentType.deleteById);

module.exports = router;
