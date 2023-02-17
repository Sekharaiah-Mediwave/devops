const { Sequelize } = require('../services/imports');

const { Op } = Sequelize;

module.exports = function modelRole(sequelize, types) {
  const AppointmentType = sequelize.define(
    'appointment_type',
    {
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
      code: {
        type: types.STRING,
        allowNull: false,
      },
      description: {
        type: types.TEXT,
        defaultValue: null,
      },
      vaccination: {
        type: types.BOOLEAN,
        defaultValue: false,
      },
      questionnaire: {
        type: types.BOOLEAN,
        defaultValue: false,
      },
      status: {
        type: types.STRING,
        defaultValue: 'active',
      },
      createdAt: {
        type: types.DATE,
        defaultValue: types.NOW,
      },
      updatedAt: {
        type: types.DATE,
        defaultValue: types.NOW,
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
    },
    {
      tableName: 'appointment_type',
      defaultScope: {
        where: {
          status: {
            [Op.ne]: 'Deleted'
          }
        }
      }
    }
  );

  AppointmentType.associate = (models) => {
    AppointmentType.belongsTo(models.user, {
      as: 'createdUser',
      targetKey: 'uuid',
      foreignKey: 'created_by',
    });
    AppointmentType.belongsTo(models.user, {
      as: 'updatedUser',
      targetKey: 'uuid',
      foreignKey: 'updated_by',
    });
  };

  return AppointmentType;
};
