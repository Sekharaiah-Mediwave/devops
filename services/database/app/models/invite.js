module.exports = function modelRole(sequelize, types) {
  const Invite = sequelize.define(
    'invite',
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
      fromId: {
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
      email: {
        type: types.STRING,
        allowNull: false,
      },
      firstName: {
        type: types.STRING,
      },
      lastName: {
        type: types.STRING,
      },
      relationship: {
        type: types.STRING,
        allowNull: false, // carer,patient,clinician
      },
      inviteCode: {
        type: types.STRING,
        allowNull: false,
      },
      modules: {
        type: types.JSONB,
      },
      toId: {
        type: types.UUID,
        references: {
          model: {
            tableName: 'user',
          },
          key: 'uuid',
        },
        onDelete: 'CASCADE',
      },
      status: {
        type: types.STRING, // pending,accepted
        defaultValue: 'pending',
      },
    },
    {
      tableName: 'invite',
      indexes: [
        {
          fields: ['id', 'uuid', 'userId'],
        },
      ],
    }
  );

  Invite.associate = function (models) {
    Invite.belongsTo(models.user, {
      as: 'userInfo',
      foreignKey: 'fromId',
      targetKey: 'uuid',
    });
  };

  Invite.associate = function (models) {
    Invite.belongsTo(models.user, {
      as: 'userInfo',
      foreignKey: 'toId',
      targetKey: 'uuid',
    });

    Invite.belongsTo(models.user_module, {
      as: 'userModule',
      targetKey: 'userId',
      foreignKey: 'toId',
    });
  };

  return Invite;
};
