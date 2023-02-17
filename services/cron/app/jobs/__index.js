/* eslint-disable no-undef */
const { fs } = require('../services/imports');

const exportJson = {};

fs.readdirSync(__dirname)
  .filter((file) => file !== '__index.js')
  .forEach((file) => {
    // console.info(`Loading file ${file}`);
    exportJson[file] = require(`${__dirname}/${file}`);
  });

module.exports = exportJson;
