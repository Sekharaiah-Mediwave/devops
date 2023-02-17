module.exports = function modelRole(sequelize, types) {
  const AppSettings = sequelize.define(
    'app_settings',
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
      globalSettings: {
        type: types.JSONB,
      },
      userSettings: {
        type: types.JSONB,
      },
      createdBy: {
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
      updatedBy: {
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
      tableName: 'app_settings',
    }
  );

  AppSettings.associate = (models) => {
    AppSettings.belongsTo(models.user, {
      as: 'createdUserInfo',
      foreignKey: 'createdBy',
      targetKey: 'uuid',
    });
    AppSettings.belongsTo(models.user, {
      as: 'updatedUserInfo',
      foreignKey: 'updatedBy',
      targetKey: 'uuid',
    });
  };

  return AppSettings;
};
