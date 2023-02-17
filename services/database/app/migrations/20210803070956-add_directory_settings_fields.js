module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDefinition = await queryInterface.describeTable('directory_settings');
    if (!tableDefinition.specialism) {
      await queryInterface.addColumn('directory_settings', 'specialism', { type: Sequelize.BOOLEAN });
    }
    if (!tableDefinition.qualification) {
      await queryInterface.addColumn('directory_settings', 'qualification', { type: Sequelize.BOOLEAN });
    }
    if (!tableDefinition.expertise) {
      await queryInterface.addColumn('directory_settings', 'expertise', { type: Sequelize.BOOLEAN });
    }
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('directory_settings', 'specialism');
    await queryInterface.removeColumn('directory_settings', 'qualification');
    await queryInterface.removeColumn('directory_settings', 'expertise');
  },
};
