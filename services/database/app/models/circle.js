module.exports = function modelRole(sequelize, types) {
  const Circle = sequelize.define(
    'circle',
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
        allowNull: true,
        onDelete: 'CASCADE',
      },
      teamId: {
        type: types.UUID,
        references: {
          model: {
            tableName: 'careteam_teams',
          },
          key: 'uuid',
        },
        allowNull: true,
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
      toId: {
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
        type: types.STRING, // pending,accepted,rejected,canceled,revoked
        defaultValue: 'pending',
      },
      revokedBy: {
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
      connectedBy: {
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
      viewedByUser: {
        type: types.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'circle',
      indexes: [
        {
          fields: ['id', 'uuid', 'userId'],
        },
      ],
    }
  );
  Circle.associate = function (models) {
    Circle.belongsTo(models.user, {
      as: 'connectTo',
      foreignKey: 'toId',
      targetKey: 'uuid',
    });
    Circle.belongsTo(models.user, {
      as: 'connectFrom',
      foreignKey: 'fromId',
      targetKey: 'uuid',
    });
    Circle.hasMany(models.share, {
      as: 'shareInfo',
      foreignKey: 'circleId',
      sourceKey: 'uuid',
    });
  };

  return Circle;
};
