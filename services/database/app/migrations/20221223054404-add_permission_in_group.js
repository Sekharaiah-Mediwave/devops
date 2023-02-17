module.exports = {
  up: async (queryInterface, Sequelize) => {
      const tableDefinition = await queryInterface.describeTable('group');
      if (!tableDefinition.send_to) {
        await queryInterface.addColumn('group', 'permission', {
          type: Sequelize.JSONB,
          defaultValue: null,
        });
      }
    },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('group', 'permission');
  }
};
