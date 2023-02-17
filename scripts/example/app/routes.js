const Router = require('koa-router');
const exampleController = require('./controllers/example');

const router = new Router();

router.get('/example', exampleController.exampleFunction);

module.exports = router;
