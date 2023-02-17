/* eslint-disable no-undef */
const { Router, fs } = require('../services/imports');

const router = new Router();

const middleware = require('../middleware');

fs.readdirSync(__dirname)
  .filter((file) => file.indexOf('.') !== 0 && file !== '__index.js' && file !== '__common.js')
  .forEach((file) => {
    // console.info(`Loading file ${file}`);
    if (file.slice(-3) === '.js') {
      const routesFile = require(`${__dirname}/${file}`);
      routesFile.stack.forEach((elem) => {
        router.use(elem.path, middleware.checkSetToken);
      });
      router.use(routesFile.routes(), routesFile.allowedMethods());
    } else if (fs.lstatSync(`${__dirname}/${file}`).isDirectory() && fs.existsSync(`${__dirname}/${file}/__index.js`)) {
      const indexFile = require(`${__dirname}/${file}/__index.js`);
      router.use(indexFile.routes(), indexFile.allowedMethods());
    }
  });

module.exports = router;
