module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDefinition = await queryInterface.describeTable('user_profile');
    if (!tableDefinition.department) {
      await queryInterface.addColumn('user_profile', 'department', { type: Sequelize.JSONB });
    }
    if (!tableDefinition.qualification) {
      await queryInterface.addColumn('user_profile', 'qualification', { type: Sequelize.JSONB });
    }
    if (!tableDefinition.expertise) {
      await queryInterface.addColumn('user_profile', 'expertise', { type: Sequelize.STRING(1000) });
    }
    if (!tableDefinition.type) {
      await queryInterface.addColumn('user_profile', 'type', { type: Sequelize.STRING });
    }
    if (!tableDefinition.createdBy) {
      await queryInterface.addColumn('user_profile', 'createdBy', { type: Sequelize.UUID });
    }
    if (!tableDefinition.access) {
      await queryInterface.addColumn('user_profile', 'access', { type: Sequelize.JSON });
    }
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('user_profile', 'department');
    await queryInterface.removeColumn('user_profile', 'qualification');
    await queryInterface.removeColumn('user_profile', 'expertise');
    await queryInterface.removeColumn('user_profile', 'type');
    await queryInterface.removeColumn('user_profile', 'createdBy');
    await queryInterface.removeColumn('user_profile', 'access');
  },
};
