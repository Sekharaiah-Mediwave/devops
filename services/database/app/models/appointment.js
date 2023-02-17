const { Sequelize } = require('../services/imports');

const { Op } = Sequelize;

module.exports = function modelRole(sequelize, types) {
  const Appointment = sequelize.define(
    'appointment',
    {
      id: {
        type: types.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        unique: true,
      },
      uuid: {
        type: types.UUID,
        defaultValue: types.UUIDV4,
        primarykey: true,
        unique: true,
      },
      joining_details: {
        type: types.TEXT,
        defaultValue: null,
      },
      notes: {
        type: types.TEXT,
        defaultValue: null,
      },
      cancellation_reason: {
        type: types.TEXT,
        defaultValue: null,
      },
      urgency_type: {
        type: types.STRING,
        defaultValue: null,
      },
      diagnosis_type_id: {
        type: types.UUID,
        references: {
          model: {
            tableName: 'diagnosis_type',
          },
          key: 'uuid',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      appointment_type_id: {
        type: types.UUID,
        references: {
          model: {
            tableName: 'appointment_type',
          },
          key: 'uuid',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      clinic_location_id: {
        type: types.UUID,
        references: {
          model: {
            tableName: 'clinic_location',
          },
          key: 'uuid',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      clinic_name_id: {
        type: types.UUID,
        references: {
          model: {
            tableName: 'clinic_name',
          },
          key: 'uuid',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      clinic_id: {
        type: types.UUID,
        references: {
          model: {
            tableName: 'clinic',
          },
          key: 'uuid',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      slot_id: {
        type: types.UUID,
        references: {
          model: {
            tableName: 'slot',
          },
          key: 'uuid',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      appointment_status_id: {
        type: types.UUID,
        references: {
          model: {
            tableName: 'appointment_status',
          },
          key: 'uuid',
        },
        allowNull: true,
        onDelete: 'CASCADE',
      },
      date: {
        type: types.DATE,
        allowNull: false,
      },
      start_time: {
        type: types.DATE,
        allowNull: false,
      },
      end_time: {
        type: types.DATE,
        allowNull: false,
      },
      status: {
        type: types.STRING,
        defaultValue: 'active', // active, missed, completed, cancelled, Deleted
      },
      booked_from: {
        type: types.UUID,
        references: {
          model: {
            tableName: 'user',
          },
          key: 'uuid',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      booked_to: {
        type: types.UUID,
        references: {
          model: {
            tableName: 'user',
          },
          key: 'uuid',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      created_by: {
        type: types.UUID,
        references: {
          model: {
            tableName: 'user',
          },
          key: 'uuid',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      updated_by: {
        type: types.UUID,
        references: {
          model: {
            tableName: 'user',
          },
          key: 'uuid',
        },
        allowNull: true,
        onDelete: 'CASCADE',
      },
      cancelled_by: {
        type: types.UUID,
        references: {
          model: {
            tableName: 'user',
          },
          key: 'uuid',
        },
        allowNull: true,
        onDelete: 'CASCADE',
      },
    },
    {
      tableName: 'appointment',
      defaultScope: {
        where: {
          status: {
            [Op.ne]: 'Deleted'
          }
        }
      }
    }
  );

  Appointment.associate = (models) => {
    Appointment.belongsTo(models.user, {
      as: 'createdUser',
      targetKey: 'uuid',
      foreignKey: 'created_by',
    });
    Appointment.belongsTo(models.user, {
      as: 'updatedUser',
      targetKey: 'uuid',
      foreignKey: 'updated_by',
    });
    Appointment.belongsTo(models.user, {
      as: 'cancelledUser',
      targetKey: 'uuid',
      foreignKey: 'cancelled_by',
    });
    Appointment.belongsTo(models.user, {
      as: 'bookedFrom',
      targetKey: 'uuid',
      foreignKey: 'booked_from',
    });
    Appointment.belongsTo(models.user, {
      as: 'bookedTo',
      targetKey: 'uuid',
      foreignKey: 'booked_to',
    });
    Appointment.belongsTo(models.clinic, {
      as: 'clinicDetails',
      targetKey: 'uuid',
      foreignKey: 'clinic_id',
    });
    Appointment.belongsTo(models.clinic_name, {
      as: 'clinicName',
      targetKey: 'uuid',
      foreignKey: 'clinic_name_id',
    });
    Appointment.belongsTo(models.clinic_location, {
      as: 'clinicLocation',
      targetKey: 'uuid',
      foreignKey: 'clinic_location_id',
    });
    Appointment.belongsTo(models.appointment_type, {
      as: 'appointmentType',
      targetKey: 'uuid',
      foreignKey: 'appointment_type_id',
    });
    Appointment.belongsTo(models.diagnosis_type, {
      as: 'diagnosisType',
      targetKey: 'uuid',
      foreignKey: 'diagnosis_type_id',
    });
    Appointment.belongsTo(models.slot, {
      as: 'slot',
      targetKey: 'uuid',
      foreignKey: 'slot_id',
    });
    Appointment.belongsTo(models.appointment_status, {
      as: 'appointmentStatus',
      targetKey: 'uuid',
      foreignKey: 'appointment_status_id',
    });
  };

  return Appointment;
};
