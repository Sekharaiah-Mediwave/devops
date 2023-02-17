module.exports = {
  up: async (queryInterface, SequelizeTypes) => {
    const tableDefinition = await queryInterface.describeTable('appointment');
    if (!tableDefinition.notes) {
      await queryInterface.addColumn('appointment', 'notes', {
        type: SequelizeTypes.TEXT
      });
    }
  },
  down: async (queryInterface) => {
    const tableDefinition = await queryInterface.describeTable('appointment');
    if (tableDefinition.notes) {
      await queryInterface.removeColumn('appointment', 'notes');
    }
  }
};
