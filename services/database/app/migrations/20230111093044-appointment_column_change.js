module.exports = {
  up: async (queryInterface, SequelizeTypes) => {
    const tableDefinition = await queryInterface.describeTable('appointment');
    if (tableDefinition.diagnosis_type) {
      await queryInterface.removeColumn('appointment', 'diagnosis_type');
    }
    if (tableDefinition.patient_id) {
      await queryInterface.removeColumn('appointment', 'patient_id');
    }
    if (!tableDefinition.diagnosis_type_id) {
      await queryInterface.addColumn('appointment', 'diagnosis_type_id', {
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
      await queryInterface.addColumn('appointment', 'appointment_type_id', {
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
    if (!tableDefinition.clinic_location_id) {
      await queryInterface.addColumn('appointment', 'clinic_location_id', {
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
    if (!tableDefinition.clinic_name_id) {
      await queryInterface.addColumn('appointment', 'clinic_name_id', {
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
    }
    if (!tableDefinition.booked_to) {
      await queryInterface.addColumn('appointment', 'booked_to', {
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
    if (!tableDefinition.booked_from) {
      await queryInterface.addColumn('appointment', 'booked_from', {
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
    if (!tableDefinition.updated_by) {
      await queryInterface.addColumn('appointment', 'updated_by', {
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
  },
  down: async (queryInterface, SequelizeTypes) => {
    const tableDefinition = await queryInterface.describeTable('appointment');
    if (!tableDefinition.diagnosis_type) {
      await queryInterface.addColumn('clinic', 'diagnosis_type', {
        type: SequelizeTypes.STRING
      });
    }
    if (!tableDefinition.patient_id) {
      await queryInterface.addColumn('appointment', 'patient_id', {
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
    if (tableDefinition.diagnosis_type_id) {
      await queryInterface.removeColumn('appointment', 'diagnosis_type_id');
    }
    if (tableDefinition.booked_to) {
      await queryInterface.removeColumn('appointment', 'booked_to');
    }
    if (tableDefinition.booked_from) {
      await queryInterface.removeColumn('appointment', 'booked_from');
    }
    if (tableDefinition.appointment_type_id) {
      await queryInterface.removeColumn('appointment', 'appointment_type_id');
    }
    if (tableDefinition.clinic_location_id) {
      await queryInterface.removeColumn('appointment', 'clinic_location_id');
    }
    if (tableDefinition.clinic_name_id) {
      await queryInterface.removeColumn('appointment', 'clinic_name_id');
    }
    if (tableDefinition.updated_by) {
      await queryInterface.removeColumn('appointment', 'updated_by');
    }
  }
};
