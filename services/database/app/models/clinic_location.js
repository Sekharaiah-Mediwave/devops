const { Sequelize } = require('../services/imports');

const { Op } = Sequelize;

module.exports = function modelRole(sequelize, types) {
  const clinicLocation = sequelize.define(
    'clinic_location',
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
      location: {
        type: types.STRING,
        allowNull: false
      },
      address: {
        type: types.STRING,
        defaultValue: null,
      },
      postcode: {
        type: types.STRING,
        defaultValue: null,
      },
      city: {
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
      tableName: 'clinic_location',
      defaultScope: {
        where: {
          status: {
            [Op.ne]: 'Deleted'
          }
        }
      }
    }
  );

  clinicLocation.associate = (models) => {
    clinicLocation.belongsTo(models.user, {
      as: 'createdUser',
      targetKey: 'uuid',
      foreignKey: 'created_by',
    });
    clinicLocation.belongsTo(models.user, {
      as: 'updatedUser',
      targetKey: 'uuid',
      foreignKey: 'updated_by',
    });
    clinicLocation.hasMany(models.clinic_name_location_relation, {
      as: 'clinicNameRelation',
      foreignKey: 'clinic_location_id',
      sourceKey: 'uuid',
    });
    clinicLocation.hasMany(models.clinic, {
      as: 'clinic',
      foreignKey: 'clinic_location_id',
      sourceKey: 'uuid',
    });
  };

  return clinicLocation;
};
