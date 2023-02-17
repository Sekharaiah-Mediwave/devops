const { Sequelize } = require('../services/imports');

const { Op } = Sequelize;

module.exports = function modelRole(sequelize, types) {
  const AssingDiagnosisType = sequelize.define(
    'assign_diagnosis_type',
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
      userId: {
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
      status: {
        type: types.STRING,
        defaultValue: 'active',
      },
    },
    {
      tableName: 'assign_diagnosis_type',
      defaultScope: {
        where: {
          status: {
            [Op.ne]: 'Deleted'
          }
        }
      }
    }
  );

  AssingDiagnosisType.associate = (models) => {
    AssingDiagnosisType.belongsTo(models.diagnosis_type, {
      as: 'diagnosisType',
      targetKey: 'uuid',
      foreignKey: 'diagnosis_type_id',
    });
    AssingDiagnosisType.belongsTo(models.user, {
      as: 'userInfo',
      targetKey: 'uuid',
      foreignKey: 'userId',
    });
  };

  return AssingDiagnosisType;
};
