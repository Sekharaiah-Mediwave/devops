module.exports = function modelRole(sequelize, types) {
  const group = sequelize.define(
    'group',
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
      name: {
        type: types.STRING,
        defaultValue: null
      },
      status: {
        type: types.STRING,
        defaultValue: "active",
      },
      permission: {
        type: types.JSONB,
        defaultValue: null
      },
    },
    {
      tableName: 'group',
    }
  );

  group.associate = function (models) {
    group.belongsTo(models.user, {
      as: 'userInfo',
      targetKey: 'uuid',
      foreignKey: 'userId',
    });
    group.hasMany(models.group_member, {
      as: 'groupMembers',
      foreignKey: 'groupId',
      sourceKey: 'uuid',
    });

  };

  return group;
};
