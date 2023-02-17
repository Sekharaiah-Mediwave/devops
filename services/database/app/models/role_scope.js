module.exports = function modelRole(sequelize, types) {
  const RoleScope = sequelize.define(
    'role_scope',
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
      roleScope: {
        type: types.JSONB,
      },
      status: {
        type: types.BOOLEAN,
      }

    },
    {
      tableName: 'role_scope',
    }
  );

  RoleScope.associate = (models) => {
    RoleScope.belongsTo(models.roles, {
      as: 'roleInfo',
      foreignKey: 'roleId',
      targetKey: 'uuid',
    });
  };

  return RoleScope;
};
