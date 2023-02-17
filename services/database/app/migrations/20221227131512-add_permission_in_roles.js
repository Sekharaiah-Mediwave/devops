module.exports = {
  up: async (queryInterface, Sequelize) => {
      const tableDefinition = await queryInterface.describeTable('roles');
      if (!tableDefinition.permission) {
        await queryInterface.addColumn('roles', 'permission', {
          type: Sequelize.JSONB,
          defaultValue: null,
        });
      }
      if (!tableDefinition.permissionStatus) {
        await queryInterface.addColumn('roles', 'permissionStatus', {
          type: Sequelize.STRING,
          defaultValue: "deactive",
        });
      }
    },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('roles', 'permission');
    await queryInterface.removeColumn('roles', 'permissionStatus');
  }
};
