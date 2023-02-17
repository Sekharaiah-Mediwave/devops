const { Sequelize } = require('../services/imports');

const { Op } = Sequelize;

module.exports = function modelRole(sequelize, types) {
  const Clinic = sequelize.define(
    'clinic',
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
      clinic_joining_details: {
        type: types.TEXT,
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
      start_time: {
        type: types.DATE,
        defaultValue: null,
      },
      end_time: {
        type: types.DATE,
        defaultValue: null,
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
      status: {
        type: types.STRING,
        defaultValue: 'active',
      },
    },
    {
      tableName: 'clinic',
      defaultScope: {
        where: {
          status: {
            [Op.ne]: 'Deleted'
          }
        }
      }
    }
  );

  Clinic.associate = (models) => {
    Clinic.belongsTo(models.user, {
      as: 'createdUser',
      targetKey: 'uuid',
      foreignKey: 'created_by',
    });
    Clinic.belongsTo(models.user, {
      as: 'updatedUser',
      targetKey: 'uuid',
      foreignKey: 'updated_by',
    });
    Clinic.belongsTo(models.diagnosis_type, {
      as: 'diagnosisType',
      targetKey: 'uuid',
      foreignKey: 'diagnosis_type_id',
    });
    Clinic.belongsTo(models.clinic_location, {
      as: 'clinicLocation',
      targetKey: 'uuid',
      foreignKey: 'clinic_location_id',
    });
    Clinic.belongsTo(models.clinic_name, {
      as: 'clinicName',
      targetKey: 'uuid',
      foreignKey: 'clinic_name_id',
    });
    Clinic.belongsTo(models.appointment_type, {
      as: 'AppointmentType',
      targetKey: 'uuid',
      foreignKey: 'appointment_type_id',
    });
    Clinic.hasMany(models.clinic_time, {
      as: 'clinicTime',
      foreignKey: 'clinic_id',
      sourceKey: 'uuid',
    });
    Clinic.hasMany(models.appointment, {
      as: 'appointments',
      foreignKey: 'clinic_id',
      sourceKey: 'uuid',
    });
    Clinic.hasMany(models.slot, {
      as: 'slot',
      foreignKey: 'clinic_id',
      sourceKey: 'uuid',
    });
  };

  return Clinic;
};
