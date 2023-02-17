module.exports = {
  up: async (queryInterface, SequelizeTypes) => {
    const tableDefinition = await queryInterface.describeTable('appointment_type');
    if (!tableDefinition.code) {
      await queryInterface.addColumn('appointment_type', 'code', {
        type: SequelizeTypes.STRING,
        allowNull: false,
        defaultValue: ''
      });
    }
    if (!tableDefinition.vaccination) {
      await queryInterface.addColumn('appointment_type', 'vaccination', {
        type: SequelizeTypes.BOOLEAN,
        defaultValue: false,
      });
    }
    if (!tableDefinition.questionnaire) {
      await queryInterface.addColumn('appointment_type', 'questionnaire', {
        type: SequelizeTypes.BOOLEAN,
        defaultValue: false,
      });
    }
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('appointment_type', 'code');
    await queryInterface.removeColumn('appointment_type', 'vaccination');
    await queryInterface.removeColumn('appointment_type', 'questionnaire');
  }
};
