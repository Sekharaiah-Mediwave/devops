module.exports = function modelRole(sequelize, types) {
  const UserRole = sequelize.define(
    'user_role',
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
      roleId: {
        type: types.UUID,
        references: {
          model: {
            tableName: 'roles',
          },
          key: 'uuid',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
    },
    {
      tableName: 'user_role',
    }
  );

  UserRole.associate = (models) => {
    UserRole.belongsTo(models.user, {
      as: 'userInfo',
      foreignKey: 'userId',
      targetKey: 'uuid',
    });
    UserRole.belongsTo(models.roles, {
      as: 'roleInfo',
      foreignKey: 'roleId',
      targetKey: 'uuid',
    });
  };

  return UserRole;
};
