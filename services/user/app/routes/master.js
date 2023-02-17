const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/master',
});

const middleware = require('../middleware');
const config = require('../config/config');
const master = require('../controllers/master');

router.get('/get-by-id', middleware.checkAddUrlToHit(config.databaseUrl), master.getById);
router.get('/get-list', middleware.checkAddUrlToHit(config.databaseUrl), master.getListsFromTable);
router.post('/save', middleware.checkAddUrlToHit(config.databaseUrl), master.saveData);
router.put('/update', middleware.checkAddUrlToHit(config.databaseUrl), master.updateData);
router.delete('/delete', middleware.checkAddUrlToHit(config.databaseUrl), master.deleteData);

module.exports = router;
