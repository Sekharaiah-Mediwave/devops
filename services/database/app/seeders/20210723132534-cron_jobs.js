const { uuidv4 } = require('../services/imports');
const { models, Sequelize } = require('../config/sequelize');

const { Op } = Sequelize;

const arrayToUpdate = [
  {
    uuid: uuidv4(),
    name: 'Smoke daily reminder',
    mailApiRoute: '/smoke/get-by-id/ca6bce93-a4b4-4a86-b3c6-19d1d8f03d67',
    cronInitialValues: null,
    cronScheduleTime: '0 0 * * *',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

module.exports = {
  up: async (queryInterface) => {
    let existRecords = await models.cron_jobs.findAll({
      where: { name: { [Op.in]: arrayToUpdate.map((recordData) => recordData.name) } },
      attributes: ['id', 'name'],
    });
    existRecords = existRecords.map((tableData) => tableData.toJSON());
    const filteredArr = arrayToUpdate.filter((el) => !existRecords.some((f) => f.name == el.name));
    if (filteredArr.length) {
      return queryInterface.bulkInsert('cron_jobs', filteredArr, {});
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('cron_jobs', {});
  },
};
