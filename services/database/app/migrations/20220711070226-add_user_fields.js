module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDefinition = await queryInterface.describeTable('user');
    if (!tableDefinition.consent) {
      await queryInterface.addColumn('user', 'consent', { type: Sequelize.BOOLEAN });
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
