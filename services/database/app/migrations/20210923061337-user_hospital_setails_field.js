module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDefinition = await queryInterface.describeTable('user_profile');
    if (tableDefinition.hospitalNumber) {
      await queryInterface.removeColumn('user_profile', 'hospitalNumber');
    }
    if (!tableDefinition.hospitalDetails) {
      await queryInterface.addColumn('user_profile', 'hospitalDetails', { type: Sequelize.JSONB });
    }
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('user_profile', 'hospitalDetails');
  },
};
