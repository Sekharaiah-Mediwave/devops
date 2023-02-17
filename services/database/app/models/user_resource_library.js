module.exports = function modelRole(sequelize, types) {
  const UserResourceLibrary = sequelize.define(
    'user_resource_library',
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
      favorites: {
        type: types.JSONB,
      },
      preferences: {
        type: types.JSONB,
      },
    },
    {
      tableName: 'user_resource_library',
    }
  );

  UserResourceLibrary.associate = (models) => {
    UserResourceLibrary.belongsTo(models.user, {
      as: 'userInfo',
      foreignKey: 'userId',
      targetKey: 'uuid',
    });
  };

  return UserResourceLibrary;
};
