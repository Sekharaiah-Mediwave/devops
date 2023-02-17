module.exports = {
  up: async (queryInterface, SequelizeTypes) => {
    const tableDefinition = await queryInterface.describeTable('app_settings');
    if (!tableDefinition.userSetting) {
      await queryInterface.addColumn('app_settings', 'userSettings', {
        type: SequelizeTypes.JSONB
      });
    }
  },
  down: async (queryInterface) => {
    const tableDefinition = await queryInterface.describeTable('app_settings');
    if (tableDefinition.userSetting) {
      await queryInterface.removeColumn('app_settings', 'userSettings');
    }
  }
};
