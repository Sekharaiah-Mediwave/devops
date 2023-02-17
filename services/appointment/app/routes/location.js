const { Router } = require('../services/imports');

const router = new Router({
    prefix: '/location'
});

const config = require('../config/config');
const location = require('../controllers/clinic_location');
const middleware = require('../middleware');


// Clinic Location
router.post('/get-by-location', middleware.checkAddUrlToHit(config.databaseUrl), location.getByLocation);


router.get('/get-by-id/:uuid', middleware.checkAddUrlToHit(config.databaseUrl), location.getById);
router.get('/get-name-by-id/:uuid', middleware.checkAddUrlToHit(config.databaseUrl), location.getNameById);
router.get('/get-list', middleware.checkAddUrlToHit(config.databaseUrl), location.getList);
router.delete('/delete-location', middleware.checkAddUrlToHit(config.databaseUrl), location.deleteLocationById);
router.delete('/delete-name', middleware.checkAddUrlToHit(config.databaseUrl), location.deleteNameById);
router.put('/update', middleware.checkAddUrlToHit(config.databaseUrl), location.updateRecord);
router.post('/save', middleware.checkAddUrlToHit(config.databaseUrl), location.saveRecord);
router.get('/get-name-list', middleware.checkAddUrlToHit(config.databaseUrl), location.getNamesList);
router.get('/get-locations-list', middleware.checkAddUrlToHit(config.databaseUrl), location.getLocationsList);

module.exports = router;
