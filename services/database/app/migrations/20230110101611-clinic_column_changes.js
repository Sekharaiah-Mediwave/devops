module.exports = {
  up: async (queryInterface, SequelizeTypes) => {
    const tableDefinition = await queryInterface.describeTable('clinic');
    if (!tableDefinition.clinic_name_id) {
      await queryInterface.addColumn('clinic', 'clinic_name_id', {
        type: SequelizeTypes.UUID,
        references: {
          model: {
            tableName: 'clinic_location',
          },
          key: 'uuid',
        },
        allowNull: true,
        onDelete: 'CASCADE',
      });
    }
    if (!tableDefinition.diagnosis_type_id) {
      await queryInterface.addColumn('clinic', 'diagnosis_type_id', {
        type: SequelizeTypes.UUID,
        references: {
          model: {
            tableName: 'diagnosis_type',
          },
          key: 'uuid',
        },
        allowNull: true,
        onDelete: 'CASCADE',
      });
    }
    if (!tableDefinition.appointment_type_id) {
      await queryInterface.addColumn('clinic', 'appointment_type_id', {
        type: SequelizeTypes.UUID,
        references: {
          model: {
            tableName: 'appointment_type',
          },
          key: 'uuid',
        },
        allowNull: true,
        onDelete: 'CASCADE',
      });
    }
    if (!tableDefinition.updated_by) {
      await queryInterface.addColumn('clinic', 'updated_by', {
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
    if (!tableDefinition.status) {
      await queryInterface.addColumn('clinic', 'status', {
        type: SequelizeTypes.STRING,
        defaultValue: 'active',
      });
    }
    await queryInterface.removeColumn('clinic', 'appointment_type');
    await queryInterface.removeColumn('clinic', 'vaccination_type_id');
    await queryInterface.removeColumn('clinic', 'consultation_type');
    await queryInterface.removeColumn('clinic', 'consultation_detail');
    await queryInterface.removeColumn('clinic', 'duration');
  },
  down: async (queryInterface, SequelizeTypes) => {
    const tableDefinition = await queryInterface.describeTable('clinic');
    if (tableDefinition.status) {
      await queryInterface.removeColumn('clinic', 'status');
    }
    if (tableDefinition.clinic_name_id) {
      await queryInterface.removeColumn('clinic', 'clinic_name_id');
    }
    if (tableDefinition.updated_by) {
      await queryInterface.removeColumn('clinic', 'updated_by');
    }
    if (tableDefinition.appointment_type_id) {
      await queryInterface.removeColumn('clinic', 'appointment_type_id');
    }
    if (tableDefinition.diagnosis_type_id) {
      await queryInterface.removeColumn('clinic', 'diagnosis_type_id');
    }
    if (!tableDefinition.appointment_type) {
      await queryInterface.addColumn('clinic', 'appointment_type', {
        type: SequelizeTypes.STRING,
        defaultValue: null,
      });
    }
    if (!tableDefinition.consultation_type) {
      await queryInterface.addColumn('clinic', 'consultation_type', {
        type: SequelizeTypes.STRING,
        defaultValue: null,
      });
    }
    if (!tableDefinition.duration) {
      await queryInterface.addColumn('clinic', 'duration', {
        type: SequelizeTypes.INTEGER,
        defaultValue: null,
      });
    }
    if (!tableDefinition.consultation_detail) {
      await queryInterface.addColumn('clinic', 'consultation_detail', {
        type: SequelizeTypes.STRING,
        defaultValue: null,
      });
    }
    if (!tableDefinition.vaccination_type_id) {
      await queryInterface.addColumn('clinic', 'vaccination_type_id', {
        type: SequelizeTypes.UUID,
        references: {
          model: {
            tableName: 'vaccination_type',
          },
          key: 'uuid',
        },
        allowNull: true,
        onDelete: 'CASCADE',
      });
    }
  }
};
