module.exports = {
  up: async (queryInterface, SequelizeTypes) => {
    const tableDefinition = await queryInterface.describeTable('clinic_time');
    if (!tableDefinition.status) {
      await queryInterface.addColumn('clinic_time', 'status', {
        type: SequelizeTypes.STRING,
        defaultValue: 'active',
      });
    }
  },
  down: async (queryInterface) => {
    const tableDefinition = await queryInterface.describeTable('clinic_time');
    if (tableDefinition.status) {
      await queryInterface.removeColumn('clinic_time', 'status');
    }
  }
};
