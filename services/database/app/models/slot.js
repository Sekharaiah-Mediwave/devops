const { Sequelize } = require('../services/imports');

const { Op } = Sequelize;

module.exports = function modelRole(sequelize, types) {
  const Slot = sequelize.define(
    'slot',
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
      clinic_time_id: {
        type: types.UUID,
        references: {
          model: {
            tableName: 'clinic_time',
          },
          key: 'uuid',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      availability: {
        type: types.BOOLEAN,
        defaultValue: true,
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
      tableName: 'slot',
      defaultScope: {
        where: {
          status: {
            [Op.ne]: 'Deleted'
          }
        }
      }
    }
  );

  Slot.associate = (models) => {
    Slot.belongsTo(models.clinic, {
      as: 'clinic',
      targetKey: 'uuid',
      foreignKey: 'clinic_id',
    });
    Slot.belongsTo(models.clinic_time, {
      as: 'clinicTime',
      targetKey: 'uuid',
      foreignKey: 'clinic_time_id',
    });
  };

  return Slot;
};
