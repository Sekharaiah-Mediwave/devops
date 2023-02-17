const { Sequelize } = require('../services/imports');

const { Op } = Sequelize;

module.exports = function modelRole(sequelize, types) {
  const clinicName = sequelize.define(
    'clinic_name',
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
      name: {
        type: types.STRING,
        allowNull: false
      },
      code: {
        type: types.STRING,
        defaultValue: null,
      },
      status: {
        type: types.STRING,
        defaultValue: 'active',
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
      tableName: 'clinic_name',
      defaultScope: {
        where: {
          status: {
            [Op.ne]: 'Deleted'
          }
        }
      }
    }
  );

  clinicName.associate = (models) => {
    clinicName.belongsTo(models.user, {
      as: 'createdUser',
      targetKey: 'uuid',
      foreignKey: 'created_by',
    });
    clinicName.belongsTo(models.user, {
      as: 'updatedUser',
      targetKey: 'uuid',
      foreignKey: 'updated_by',
    });
    clinicName.hasMany(models.clinic, {
      as: 'clinic',
      foreignKey: 'clinic_name_id',
      sourceKey: 'uuid',
    });
    clinicName.hasMany(models.clinic_name_location_relation, {
      as: 'clinicLocationRelation',
      foreignKey: 'clinic_name_id',
      sourceKey: 'uuid',
    });
  };

  return clinicName;
};
