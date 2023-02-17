module.exports = {
  up: async (queryInterface, SequelizeTypes) => {
    const tableDefinition = await queryInterface.describeTable('appointment');
    if (!tableDefinition.joining_details) {
      await queryInterface.addColumn('appointment', 'joining_details', {
        type: SequelizeTypes.TEXT,
        defaultValue: null,
      });
    }
  },
  down: async (queryInterface) => {
    const tableDefinition = await queryInterface.describeTable('appointment');
    if (tableDefinition.joining_details) {
      await queryInterface.removeColumn('appointment', 'joining_details');
    }
  }
};
