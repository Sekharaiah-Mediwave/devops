module.exports = {
  up: async (queryInterface) => {
    const tableDefinition = await queryInterface.describeTable('clinic_name');
    if (tableDefinition.clinic_location_id) {
      await queryInterface.removeColumn('clinic_name', 'clinic_location_id');
    }
  },
  down: async (queryInterface, SequelizeTypes) => {
    const tableDefinition = await queryInterface.describeTable('clinic_name');
    if (!tableDefinition.clinic_location_id) {
      await queryInterface.addColumn('clinic_name', 'clinic_location_id', {
        type: SequelizeTypes.UUID,
        references: {
          model: {
            tableName: 'clinic_location',
          },
          key: 'uuid',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      });
    }
  }
};
