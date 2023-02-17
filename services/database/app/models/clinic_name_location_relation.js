const { Sequelize } = require('../services/imports');

const { Op } = Sequelize;

module.exports = function modelRole(sequelize, types) {
  const clinicNameLocationRelation = sequelize.define(
    'clinic_name_location_relation',
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
      tableName: 'clinic_name_location_relation',
      defaultScope: {
        where: {
          status: {
            [Op.ne]: 'Deleted'
          }
        }
      }
    }
  );

  clinicNameLocationRelation.associate = (models) => {
    clinicNameLocationRelation.belongsTo(models.user, {
      as: 'createdUser',
      targetKey: 'uuid',
      foreignKey: 'created_by',
    });
    clinicNameLocationRelation.belongsTo(models.user, {
      as: 'updatedUser',
      targetKey: 'uuid',
      foreignKey: 'updated_by',
    });
    clinicNameLocationRelation.belongsTo(models.clinic_location, {
      as: 'clinicLocation',
      targetKey: 'uuid',
      foreignKey: 'clinic_location_id',
    });
    clinicNameLocationRelation.belongsTo(models.clinic_name, {
      as: 'clinicName',
      targetKey: 'uuid',
      foreignKey: 'clinic_name_id',
    });
  };

  return clinicNameLocationRelation;
};
