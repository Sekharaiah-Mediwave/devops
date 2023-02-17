const { uuidv4 } = require('../services/imports');
const { models, Sequelize } = require('../config/sequelize');
const config = require('../config/config');

const { Op } = Sequelize;

const arrayToUpdate = [
  {
    uuid: uuidv4(),
    name: config.roleNames.sa,
    description: 'Access all module',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    uuid: uuidv4(),
    name: config.roleNames.a,
    description: 'Access all module except super module',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    uuid: uuidv4(),
    name: config.roleNames.cl,
    description: 'Access clinician module',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    uuid: uuidv4(),
    name: config.roleNames.p,
    description: 'Access user module',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    uuid: uuidv4(),
    name: config.roleNames.ct,
    description: 'Access care team module',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    uuid: uuidv4(),
    name: config.roleNames.t,
    description: 'Access teacher module',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    uuid: uuidv4(),
    name: config.roleNames.t,
    description: 'Access teacher module',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    uuid: uuidv4(),
    name: config.roleNames.ma,
    description: 'Access Maia system module',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

module.exports = {
  up: async (queryInterface) => {
    let existRecords = await models.roles.findAll({
      where: { name: { [Op.in]: arrayToUpdate.map((recordData) => recordData.name) } },
      attributes: ['id', 'name'],
    });
    existRecords = existRecords.map((tableData) => tableData.toJSON());
    const filteredArr = arrayToUpdate.filter((el) => !existRecords.some((f) => f.name == el.name));
    if (filteredArr.length) {
      return queryInterface.bulkInsert('roles', filteredArr, {});
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('roles', {});
  },
};
