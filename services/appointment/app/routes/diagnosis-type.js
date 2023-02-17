const { Router } = require('../services/imports');

const router = new Router({
    prefix: '/diagnosis-type'
});

const config = require('../config/config');
const diagnosis_type = require('../controllers/diagnosis_type');
const middleware = require('../middleware');

// Diagnosis Type
router.get('/get-durations', middleware.checkAddUrlToHit(config.databaseUrl), diagnosis_type.getAllDurations);
router.get('/get-by-clinician', middleware.checkAddUrlToHit(config.databaseUrl), diagnosis_type.getList);
router.get('/get-by-id/:uuid', middleware.checkAddUrlToHit(config.databaseUrl), diagnosis_type.getById);
router.get('/get-all-active', middleware.checkAddUrlToHit(config.databaseUrl), diagnosis_type.getAllActive);
router.get('/get-list', middleware.checkAddUrlToHit(config.databaseUrl), diagnosis_type.getList);
router.post('/save', middleware.checkAddUrlToHit(config.databaseUrl), diagnosis_type.saveRecord);
router.put('/update', middleware.checkAddUrlToHit(config.databaseUrl), diagnosis_type.updateRecord);
router.patch('/approve-request', middleware.checkAddUrlToHit(config.databaseUrl), diagnosis_type.approveRequest);
router.delete('/:uuid', middleware.checkAddUrlToHit(config.databaseUrl), diagnosis_type.deleteById);

module.exports = router;
