module.exports = function modelRole(sequelize, types) {
  const AssingVaccineType = sequelize.define(
    'assign_vaccine_type',
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
      vaccination_type_id: {
        type: types.UUID,
        references: {
          model: {
            tableName: 'vaccination_type',
          },
          key: 'uuid',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
    },
    {
      tableName: 'assign_vaccine_type',
    }
  );

  AssingVaccineType.associate = function (models) {
    AssingVaccineType.belongsTo(models.vaccination_type, {
      as: 'vaccinationType',
      targetKey: 'uuid',
      foreignKey: 'vaccination_type_id',
    });
    AssingVaccineType.belongsTo(models.user, {
      as: 'userInfo',
      targetKey: 'uuid',
      foreignKey: 'userId',
    });
  };

  return AssingVaccineType;
};
