module.exports = function modelRole(sequelize, types) {
  const groupMember = sequelize.define(
    'group_member',
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
      groupId: {
        type: types.UUID,
        references: {
          model: {
            tableName: 'group',
          },
          key: 'uuid',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      status: {
        type: types.STRING,
        defaultValue: "active",
      },
    },
    {
      tableName: 'group_member',
    }
  );

  groupMember.associate = function (models) {
    groupMember.belongsTo(models.group, {
      as: 'group',
      targetKey: 'uuid',
      foreignKey: 'groupId',
    });
    groupMember.belongsTo(models.user, {
      as: 'userInfo',
      targetKey: 'uuid',
      foreignKey: 'userId',
    });
  };

  return groupMember;
};
