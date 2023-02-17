const { Sequelize } = require('../services/imports');

const { Op } = Sequelize;

module.exports = function modelRole(sequelize, types) {
  const diagnosisType = sequelize.define(
    'diagnosis_type',
    {
      // id: {
      //   type: types.INTEGER,
      //   allowNull: false,
      //   primaryKey: true,
      //   autoIncrement: true,
      //   unique: true,
      // },
      uuid: {
        type: types.UUID,
        defaultValue: types.UUIDV4,
        primarykey: true,
        unique: true,
      },
      name: {
        type: types.STRING,
        defaultValue: null,
      },
      description: {
        type: types.STRING,
        defaultValue: null,
      },
      duration_id: {
        type: types.UUID,
        references: {
          model: {
            tableName: 'clinic_slot_durations',
          },
          key: 'uuid',
        },
        allowNull: true,
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
      approved_by: {
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
      approved_date: {
        type: types.DATE,
        defaultValue: null,
      },
      status: {
        type: types.STRING,
        defaultValue: 'active', // active, drafted, approval_waiting
      },
    },
    {
      tableName: 'diagnosis_type',
      defaultScope: {
        where: {
          status: {
            [Op.ne]: 'Deleted'
          }
        }
      }
    }
  );

  diagnosisType.associate = (models) => {
    diagnosisType.belongsTo(models.user, {
      as: 'createdUser',
      targetKey: 'uuid',
      foreignKey: 'created_by',
    });
    diagnosisType.belongsTo(models.user, {
      as: 'approvedUser',
      targetKey: 'uuid',
      foreignKey: 'approved_by',
    });
    diagnosisType.belongsTo(models.clinic_slot_durations, {
      as: 'slotDuration',
      targetKey: 'uuid',
      foreignKey: 'duration_id',
    });
    diagnosisType.hasMany(models.assign_diagnosis_type, {
      as: 'Clinicians',
      foreignKey: 'diagnosis_type_id',
      sourceKey: 'uuid',
    });
  };

  return diagnosisType;
};
