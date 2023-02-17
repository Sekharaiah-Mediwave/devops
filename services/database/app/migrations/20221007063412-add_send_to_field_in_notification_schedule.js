module.exports = {
  up: async (queryInterface, Sequelize) => {
      const tableDefinition = await queryInterface.describeTable('notification_schedule');
      if (!tableDefinition.send_to) {
        await queryInterface.addColumn('notification_schedule', 'send_to', {
          type: Sequelize.ARRAY(Sequelize.JSONB),
          allowNull: true,
          defaultValue: null,
        });
      }
    },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('notification_schedule', 'send_to');
  }
};
