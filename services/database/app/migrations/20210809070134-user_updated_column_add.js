module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDefinition = await queryInterface.describeTable('user_profile');
    if (!tableDefinition.updatedBy) {
      await queryInterface.addColumn('user_profile', 'updatedBy', { type: Sequelize.UUID });
    }
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('user_profile', 'updatedBy');
  },
};
