module.exports = function modelRole(sequelize, types) {
  const UserModule = sequelize.define(
    'user_module',
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
      permission: {
        type: types.JSONB,
        defaultValue: null
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
        type: types.STRING,
        defaultValue: null,
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
    },
    {
      tableName: 'user_module',
    }
  );

  UserModule.associate = (models) => {
    UserModule.belongsTo(models.user, {
      as: 'userInfo',
      foreignKey: 'userId',
      targetKey: 'uuid',
    });
    UserModule.belongsTo(models.user, {
      as: 'createdByInfo',
      foreignKey: 'createdBy',
      targetKey: 'uuid',
    });
  };

  return UserModule;
};
