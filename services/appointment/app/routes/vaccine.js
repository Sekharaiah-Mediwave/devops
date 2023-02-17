const { Router } = require('../services/imports');

const router = new Router({
    prefix: '/vaccine'
});

const config = require('../config/config');
const vaccination_type = require('../controllers/vaccination_type');
const middleware = require('../middleware');

// Vaccination Type
router.get('/get-by-clinician', middleware.checkAddUrlToHit(config.databaseUrl), vaccination_type.getList);
router.get('/get-by-id/:uuid', middleware.checkAddUrlToHit(config.databaseUrl), vaccination_type.getById);
router.get('/get-list', middleware.checkAddUrlToHit(config.databaseUrl), vaccination_type.getList);
router.post('/save', middleware.checkAddUrlToHit(config.databaseUrl), vaccination_type.saveRecord);
router.put('/update/assign-questionnaire', middleware.checkAddUrlToHit(config.databaseUrl), vaccination_type.assignQuestionnaire);
router.put('/update', middleware.checkAddUrlToHit(config.databaseUrl), vaccination_type.updateRecord);
router.delete('/:uuid', middleware.checkAddUrlToHit(config.databaseUrl), vaccination_type.deleteById);

module.exports = router;
