module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDefinition = await queryInterface.describeTable('assign_diagnosis_type');
    if (!tableDefinition.status) {
      await queryInterface.addColumn('assign_diagnosis_type', 'status', {
        type: Sequelize.STRING,
        defaultValue: 'active',
      });
    }
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('assign_diagnosis_type', 'status');
  }
};
