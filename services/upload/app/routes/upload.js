const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/upload',
});
const upload = require('../controllers/upload');

router.post('/file', upload.uploadFile);
router.delete('/delete-file', upload.deleteFile);

module.exports = router;
