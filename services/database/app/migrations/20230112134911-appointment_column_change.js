module.exports = {
  up: async (queryInterface, SequelizeTypes) => {
    const tableDefinition = await queryInterface.describeTable('appointment');
    if (!tableDefinition.cancelled_by) {
      await queryInterface.addColumn('appointment', 'cancelled_by', {
        type: SequelizeTypes.UUID,
        references: {
          model: {
            tableName: 'user',
          },
          key: 'uuid',
        },
        allowNull: true,
        onDelete: 'CASCADE',
      });
    }
    if (!tableDefinition.cancellation_reason) {
      await queryInterface.addColumn('appointment', 'cancellation_reason', {
        type: SequelizeTypes.TEXT
      });
    }
  },
  down: async (queryInterface) => {
    const tableDefinition = await queryInterface.describeTable('appointment');
    if (tableDefinition.cancelled_by) {
      await queryInterface.removeColumn('appointment', 'cancelled_by');
    }
    if (tableDefinition.cancellation_reason) {
      await queryInterface.removeColumn('appointment', 'cancellation_reason');
    }
  }
};
