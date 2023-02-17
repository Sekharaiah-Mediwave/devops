module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDefinition = await queryInterface.describeTable('bmi');
    if (!tableDefinition.bmi) {
      await queryInterface.addColumn('bmi', 'bmi', { type: Sequelize.FLOAT });
    }
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('bmi', 'bmi');
  },
};
