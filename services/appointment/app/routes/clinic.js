const { Router } = require('../services/imports');

const router = new Router({
    prefix: '/clinic'
});

const config = require('../config/config');
const clinic = require('../controllers/clinic');
const middleware = require('../middleware');

// Clinic
router.get('/get-by-id/:uuid', middleware.checkAddUrlToHit(config.databaseUrl), clinic.getById);
router.get('/get-list', middleware.checkAddUrlToHit(config.databaseUrl), clinic.getList);
router.get('/get-list-dashboard-count', middleware.checkAddUrlToHit(config.databaseUrl), clinic.getList);
router.post('/save', middleware.checkAddUrlToHit(config.databaseUrl), clinic.saveRecord);
router.put('/update', middleware.checkAddUrlToHit(config.databaseUrl), clinic.updateRecord);
router.delete('/:uuid', middleware.checkAddUrlToHit(config.databaseUrl), clinic.deleteById);

router.get('/get-times-by-clinic', middleware.checkAddUrlToHit(config.databaseUrl), clinic.getTimesByClinic);
router.get('/get-time-by-id', middleware.checkAddUrlToHit(config.databaseUrl), clinic.getTimeById);
router.get('/get-slots-by-clinic', middleware.checkAddUrlToHit(config.databaseUrl), clinic.getSlotsByClinic);
router.get('/get-slots-by-clinic-time', middleware.checkAddUrlToHit(config.databaseUrl), clinic.getSlotsByClinicTime);
router.get('/get-slot-by-id', middleware.checkAddUrlToHit(config.databaseUrl), clinic.getSlotById);

module.exports = router;
