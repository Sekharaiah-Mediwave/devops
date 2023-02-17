module.exports = function modelRole(sequelize, types) {
  const AuthenticatedApps = sequelize.define('authenticated_apps', {
    id: {
      type: types.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      unique: true
    },
    uuid: {
      type: types.UUID,
      defaultValue: types.UUIDV4,
      primarykey: true,
      unique: true,
    },
    appName: {
      type: types.STRING
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
    status: {
      type: types.STRING
    }

  }, {
    tableName: 'authenticated_apps'
  });

  AuthenticatedApps.associate = (models) => {
    AuthenticatedApps.belongsTo(models.user, {
      as: 'userInfo',
      foreignKey: 'userId',
      targetKey: 'uuid'
    });
  };

  return AuthenticatedApps;
};