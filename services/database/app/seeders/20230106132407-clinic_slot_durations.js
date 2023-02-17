const { uuidv4 } = require('../services/imports');
const { models, Sequelize } = require('../config/sequelize');

const { Op } = Sequelize;

const arrayToUpdate = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map((duration) => ({
  duration: `${duration}`,
  uuid: uuidv4(),
  createdAt: new Date(),
  updatedAt: new Date(),
  status: 'active'
}));

module.exports = {
  up: async (queryInterface) => {
    let existRecords = await models.clinic_slot_durations.findAll({
      where: { duration: { [Op.in]: arrayToUpdate.map((recordData) => recordData.duration) } },
      attributes: ['id', 'duration'],
    });
    existRecords = existRecords.map((tableData) => tableData.toJSON());
    const filteredArr = arrayToUpdate.filter((el) => !existRecords.some((f) => f.duration == el.duration));
    if (filteredArr.length) {
      await queryInterface.bulkInsert('clinic_slot_durations', filteredArr, {});
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('clinic_slot_durations', {});
  },
};
