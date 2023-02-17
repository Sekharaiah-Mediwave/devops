const { Sequelize } = require('../services/imports');

const { Op } = Sequelize;

module.exports = function modelRole(sequelize, types) {
  const ClinicTime = sequelize.define(
    'clinic_time',
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
      start_time: {
        type: types.DATE,
        defaultValue: null,
      },
      end_time: {
        type: types.DATE,
        defaultValue: null,
      },
      status: {
        type: types.STRING,
        defaultValue: 'active',
      },
    },
    {
      tableName: 'clinic_time',
      defaultScope: {
        where: {
          status: {
            [Op.ne]: 'Deleted'
          }
        }
      }
    }
  );

  ClinicTime.associate = (models) => {
    ClinicTime.belongsTo(models.clinic, {
      as: 'clinic',
      targetKey: 'uuid',
      foreignKey: 'clinic_id',
    });
  };

  return ClinicTime;
};
