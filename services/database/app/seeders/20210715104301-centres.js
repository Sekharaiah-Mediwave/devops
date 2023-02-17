const { uuidv4 } = require('../services/imports');
const { models, Sequelize } = require('../config/sequelize');

const { Op } = Sequelize;

const arrayToUpdate = [
  {
    uuid: uuidv4(),
    name: 'The Royal London Hospital',
    description: 'London',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    uuid: uuidv4(),
    name: 'The Royal Free Hospital',
    description: 'Pond Street, Hampstead',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    uuid: uuidv4(),
    name: 'Guy’s and St Thomas’ Hospitals',
    description: 'Westminster',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    uuid: uuidv4(),
    name: 'Chelsea and Westminster Hospital',
    description: 'Fulham Road in Chelsea',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    uuid: uuidv4(),
    name: 'St Mary’s Hospital',
    description: 'Praed Street in Paddington',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    uuid: uuidv4(),
    name: 'Moorfields Private Eye Hospital',
    description: 'Bath Street, Islington',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

module.exports = {
  up: async (queryInterface) => {
    let existRecords = await models.centre.findAll({
      where: { name: { [Op.in]: arrayToUpdate.map((recordData) => recordData.name) } },
      attributes: ['id', 'name'],
    });
    existRecords = existRecords.map((tableData) => tableData.toJSON());
    const filteredArr = arrayToUpdate.filter((el) => !existRecords.some((f) => f.name == el.name));
    if (filteredArr.length) {
      return queryInterface.bulkInsert('centre', filteredArr, {});
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('centre', {});
  },
};
