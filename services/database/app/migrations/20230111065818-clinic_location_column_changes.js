module.exports = {
  up: async (queryInterface, SequelizeTypes) => {
    const tableDefinition = await queryInterface.describeTable('clinic_location');
    if (!tableDefinition.updated_by) {
      await queryInterface.addColumn('clinic_location', 'updated_by', {
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
    if (tableDefinition.name) {
      await queryInterface.removeColumn('clinic_location', 'name');
    }
  },
  down: async (queryInterface, SequelizeTypes) => {
    const tableDefinition = await queryInterface.describeTable('clinic_location');
    if (tableDefinition.updated_by) {
      await queryInterface.removeColumn('clinic_location', 'updated_by');
    }
    if (!tableDefinition.name) {
      await queryInterface.addColumn('clinic_location', 'name', {
        type: SequelizeTypes.STRING
      });
    }
  }
};
