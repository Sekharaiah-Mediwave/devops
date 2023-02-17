/* eslint-disable no-undef */
const { Router, fs } = require('../services/imports');
const router = new Router({
    prefix: '/appointment',
});

fs.readdirSync(__dirname)
    .filter(file => (file !== '__index.js'))
    .forEach(file => {
        // console.info(`Loading file ${file}`);
        const routesFile = require(`${__dirname}/${file}`);
        router.use(routesFile.routes(), routesFile.allowedMethods());
    });

module.exports = router;
