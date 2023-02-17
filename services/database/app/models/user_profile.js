module.exports = function modelRole(sequelize, types) {
  const UserProfile = sequelize.define(
    'user_profile',
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
      centreId: {
        type: types.UUID,
        references: {
          model: {
            tableName: 'centre',
          },
          key: 'uuid',
        },
        onDelete: 'CASCADE',
      },
      specialism: {
        type: types.JSONB,
        defaultValue: [],
      },
      department: {
        type: types.JSONB,
        defaultValue: [],
      },
      qualification: {
        type: types.JSONB,
        defaultValue: [],
      },
      team: {
        type: types.JSONB,
        defaultValue: [],
      },
      jobRole: {
        type: types.JSONB,
        defaultValue: [],
      },
      nameCalled: {
        type: types.STRING,
      },
      expertise: {
        type: types.STRING(1000),
      },
      ethnicity: {
        type: types.STRING,
      },
      languagesSpoken: {
        type: types.ARRAY(types.STRING),
      },
      profilePic: {
        type: types.JSONB,
      },
      iNeedAnInterpreter: {
        type: types.BOOLEAN,
        defaultValue: false,
      },
      hospitalDetails: {
        type: types.JSONB,
        defaultValue: [],
      },
      access: {
        type: types.JSON,
      },
      type: {
        type: types.STRING,
      },
      createdBy: {
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
      updatedBy: {
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
    },
    {
      tableName: 'user_profile',
    }
  );

  UserProfile.associate = (models) => {
    UserProfile.belongsTo(models.user, {
      as: 'userInfo',
      foreignKey: 'userId',
      targetKey: 'uuid',
    });
    UserProfile.belongsTo(models.centre, {
      as: 'centre',
      foreignKey: 'centreId',
      targetKey: 'uuid',
    });
  };

  return UserProfile;
};
