module.exports = {
  up: async (queryInterface, SequelizeTypes) => {
    const tableDefinition = await queryInterface.describeTable('clinic');
    if (tableDefinition.clinic_name_id) {
      await queryInterface.removeColumn('clinic', 'clinic_name_id');
    }
    await queryInterface.addColumn('clinic', 'clinic_name_id', {
      type: SequelizeTypes.UUID,
      references: {
        model: {
          tableName: 'clinic_name',
        },
        key: 'uuid',
      },
      allowNull: true,
      onDelete: 'CASCADE',
    });
  },
  down: async () => { }
};
