const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/master',
});

const master = require('../controllers/master');

router.get('/get-by-id', master.getById);
router.get('/get-list', master.getListsFromTable);
router.post('/save', master.saveData);
router.put('/update', master.updateData);
router.delete('/delete', master.deleteData);

module.exports = router;
