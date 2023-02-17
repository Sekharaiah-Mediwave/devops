module.exports = function modelRole(sequelize, types) {
  const AccountSettings = sequelize.define(
    'account_settings',
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
      inAppNotification: {
        type: types.BOOLEAN,
        defaultValue: false,
      },
      emailAppNotification: {
        type: types.BOOLEAN,
        defaultValue: false,
      },
      notifyPeriodCount: {
        type: types.INTEGER,
        defaultValue: 0,
      },
      notifyPeriod: {
        type: types.STRING(250) /* days, weeks, months, years */,
        defaultValue: null,
      },
    },
    {
      tableName: 'account_settings',
    }
  );

  AccountSettings.associate = (models) => {
    AccountSettings.belongsTo(models.user, {
      as: 'userInfo',
      foreignKey: 'userId',
      targetKey: 'uuid',
    });
  };

  return AccountSettings;
};
