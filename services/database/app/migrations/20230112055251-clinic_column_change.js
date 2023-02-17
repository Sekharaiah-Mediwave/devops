module.exports = {
  up: async (queryInterface, SequelizeTypes) => {
    const tableDefinition = await queryInterface.describeTable('clinic');
    if (!tableDefinition.clinic_joining_details) {
      await queryInterface.addColumn('clinic', 'clinic_joining_details', {
        type: SequelizeTypes.TEXT,
        defaultValue: null,
      });
    }
  },
  down: async (queryInterface) => {
    const tableDefinition = await queryInterface.describeTable('clinic');
    if (tableDefinition.clinic_joining_details) {
      await queryInterface.removeColumn('clinic', 'clinic_joining_details');
    }
  }
};
