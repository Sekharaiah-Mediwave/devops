module.exports = {
  up: async (queryInterface, SequelizeTypes) => {
    const tableDefinition = await queryInterface.describeTable('appointment');
    if (!tableDefinition.appointment_status_id) {
      await queryInterface.addColumn('appointment', 'appointment_status_id', {
        type: SequelizeTypes.UUID,
        references: {
          model: {
            tableName: 'appointment_status',
          },
          key: 'uuid',
        },
        allowNull: true,
        onDelete: 'CASCADE',
      });
    }
  },
  down: async (queryInterface) => {
    const tableDefinition = await queryInterface.describeTable('appointment');
    if (tableDefinition.appointment_status_id) {
      await queryInterface.removeColumn('appointment', 'appointment_status_id');
    }
  }
};
