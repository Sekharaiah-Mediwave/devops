module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDefinition = await queryInterface.describeTable('chat_room_messages');
    if (!tableDefinition.seen) {
      await queryInterface.addColumn('chat_room_messages', 'seen', { type: Sequelize.BOOLEAN, defaultValue: false });
    }
  },
  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
